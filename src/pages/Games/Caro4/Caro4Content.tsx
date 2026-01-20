import { useCallback, useState, useEffect } from "react";
import styles from "../0-css/games.module.css";
import { Toast } from "../../../stores/toastStore";
import GameZone from "../GameZone/GameZone";
import { useAuthStore } from "../../../stores/authStore";
import { postGameResult } from "../../../api/games.api";
import { useNavigate } from "react-router-dom";

interface Caro4ContentProps {
  gameBoard: string[][];
  setGameBoard: React.Dispatch<React.SetStateAction<string[][]>>;
  gameBoardSize?: { rows: number; cols: number };
  setGameState?: React.Dispatch<
    React.SetStateAction<"unloaded" | "loadError" | "fetchError" | "loaded">
  >;
  currentPlayer?: "X" | "O";
  setCurrentPlayer?: React.Dispatch<React.SetStateAction<"X" | "O">>;
  isGameOver?: boolean;
  setIsGameOver?: React.Dispatch<React.SetStateAction<boolean>>;
  winner?: "X" | "O" | null;
  setWinner?: React.Dispatch<React.SetStateAction<"X" | "O" | null>>;
}

const Caro4Content = ({
  gameBoard,
  setGameBoard,
  gameBoardSize,
  setGameState,
  currentPlayer: propsCurrentPlayer = "X",
  setCurrentPlayer: propsSetCurrentPlayer,
  isGameOver: propsIsGameOver = false,
  setIsGameOver: propsSetIsGameOver,
  winner: propsWinner = null,
  setWinner: propsSetWinner,
}: Caro4ContentProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">(propsCurrentPlayer);
  const [isGameOver, setIsGameOver] = useState(propsIsGameOver);
  const [winner, setWinner] = useState<"X" | "O" | null>(propsWinner);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [gameMode, setGameMode] = useState<"goFirst" | "goSecond" | "pvp" | null>(null);
  const [selectedModeIndex, setSelectedModeIndex] = useState(0);
  const [userSymbol, setUserSymbol] = useState<"X" | "O">("X");
  const [playTime, setPlayTime] = useState(0);

  // Đếm thời gian chơi
  useEffect(() => {
    if (isGameOver || !gameMode) return;
    const timer = setInterval(() => {
      setPlayTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, gameMode]);

  // Post game result khi game kết thúc (trừ PvP mode)
  useEffect(() => {
    if (!isGameOver || gameMode === "pvp" || !gameMode || playTime === 0) return;

    const postResult = async () => {
      try {
        await postGameResult(2, score, playTime, accessToken);
        Toast({
          type: "success",
          title: "Game Recorded",
          message: "Your game record has been saved!",
        });
      } catch (error) {
        console.error("Failed to post game result:", error);
        // Toast is already shown by postGameResult function
      }
    };

    postResult();
  }, [isGameOver, gameMode, score, playTime, accessToken]);

  const modes = [
    { id: "goFirst", label: "Go First (X)", description: "You play first" },
    { id: "goSecond", label: "Go Second (O)", description: "Computer plays first" },
    { id: "pvp", label: "PvP Local", description: "Play with another player" },
  ];

  const color = { X: "#FF5733", O: "#335BFF" };

  // Hàm kiểm tra winner - Caro thắng khi nối được 5 ô
  const checkWinner = useCallback(
    (board: string[][]): "X" | "O" | null => {
      const getPlayerSymbol = (cellColor: string) => {
        if (cellColor === color["X"]) return "X";
        if (cellColor === color["O"]) return "O";
        return null;
      };

      const WIN_LENGTH = 4;
      const rows = board.length;
      const cols = board[0]?.length || 0;

      // Hàm kiểm tra 5 ô liên tiếp
      const checkLine = (cells: string[]): "X" | "O" | null => {
        for (let i = 0; i <= cells.length - WIN_LENGTH; i++) {
          const segment = cells.slice(i, i + WIN_LENGTH);
          if (segment[0] !== "" && segment.every((cell) => cell === segment[0])) {
            return getPlayerSymbol(segment[0]);
          }
        }
        return null;
      };

      // Kiểm tra các hàng
      for (let i = 0; i < rows; i++) {
        const winner = checkLine(board[i]);
        if (winner) return winner;
      }

      // Kiểm tra các cột
      for (let j = 0; j < cols; j++) {
        const column = [];
        for (let i = 0; i < rows; i++) {
          column.push(board[i][j]);
        }
        const winner = checkLine(column);
        if (winner) return winner;
      }

      // Kiểm tra đường chéo (từ trái sang phải, từ trên xuống dưới)
      for (let i = 0; i <= rows - WIN_LENGTH; i++) {
        for (let j = 0; j <= cols - WIN_LENGTH; j++) {
          const diag: string[] = [];
          for (let k = 0; k < WIN_LENGTH; k++) {
            diag.push(board[i + k][j + k]);
          }
          if (diag[0] !== "" && diag.every((cell) => cell === diag[0])) {
            return getPlayerSymbol(diag[0]);
          }
        }
      }

      // Kiểm tra đường chéo (từ phải sang trái, từ trên xuống dưới)
      for (let i = 0; i <= rows - WIN_LENGTH; i++) {
        for (let j = WIN_LENGTH - 1; j < cols; j++) {
          const diag: string[] = [];
          for (let k = 0; k < WIN_LENGTH; k++) {
            diag.push(board[i + k][j - k]);
          }
          if (diag[0] !== "" && diag.every((cell) => cell === diag[0])) {
            return getPlayerSymbol(diag[0]);
          }
        }
      }

      return null;
    },
    [color],
  );

  // Kiểm tra nước cờ hòa (board đầy không có người thắng)
  const isBoardFull = useCallback((board: string[][]) => {
    return board.every((row) => row.every((cell) => cell !== ""));
  }, []);

  const handleReturnButton = () => {
    if (gameMode) {
      setGameState && setGameState("unloaded");
      setGameMode(null);
    } else {
      navigate("/"); 
    }
  };

  // Handle keyboard input cho mode selector
  useEffect(() => {
    if (gameMode) return; // Chỉ handle khi chưa chọn mode

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedModeIndex((prev) => (prev === 0 ? modes.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedModeIndex((prev) => (prev === modes.length - 1 ? 0 : prev + 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selectedMode = modes[selectedModeIndex].id as "goFirst" | "goSecond" | "pvp";
        setGameMode(selectedMode);

        // Khởi tạo lần chơi đầu tiên
        setCurrentPlayer("X");

        if (selectedMode === "goFirst") {
          setUserSymbol("X");
        } else if (selectedMode === "goSecond") {
          setUserSymbol("O");
        } else {
          setUserSymbol("X");
        }
      } else if (e.key === "Escape") {
        handleReturnButton();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModeIndex, gameMode, modes, handleReturnButton]);

  // Hàm nội bộ để cập nhật board - dùng cho cả user và computer
  const makeMoveOnBoard = useCallback(
    (row: number, col: number, playerSymbol: "X" | "O") => {
      if (gameBoard[row][col] !== "") return; // Ô đã có nước

      setGameBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[row][col] = color[playerSymbol];

        // Kiểm tra người thắng sau khi cập nhật board
        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
          setWinner(gameWinner);
          setIsGameOver(true);

          // Cập nhật điểm scoring
          if (gameWinner === userSymbol && gameMode !== "pvp") {
            setScore((prev) => prev + 1000);
          }

          Toast({
            type: gameWinner === userSymbol && gameMode !== "pvp" ? "success" : "error",
            title: "Game Over",
            message:
              gameMode === "pvp"
                ? `${gameWinner} wins!`
                : gameWinner === userSymbol
                  ? "You win!"
                  : "You lose!",
          });
        } else if (isBoardFull(newBoard)) {
          // Nước cờ hòa
          setIsGameOver(true);
          if (gameMode !== "pvp") {
            setScore((prev) => prev + 500);
          }
          Toast({
            type: "info",
            title: "Draw",
            message: "The game is a draw!",
          });
        }

        return newBoard;
      });

      // Chuyển đổi người chơi
      setCurrentPlayer((prevPlayer) => (prevPlayer === "X" ? "O" : "X"));
    },
    [gameBoard, color, checkWinner, isBoardFull],
  );

  const handleCellClick = (row: number, col: number) => {
    // Không cho chơi nếu game đã kết thúc
    if (isGameOver) {
      Toast({ type: "warning", message: "Game is already over. Reset to play again!" });
      return;
    }

    // PvP mode - cho phép click bất kỳ lúc nào
    if (gameMode === "pvp") {
      makeMoveOnBoard(row, col, currentPlayer);
      return;
    }

    // AI mode (goFirst hoặc goSecond)
    // Ngăn user click khi máy đang suy nghĩ
    if (isComputerThinking) {
      Toast({ type: "warning", message: "Please wait for computer's turn!" });
      return;
    }

    // Ngăn user click khi không phải lượt của họ
    if (currentPlayer !== userSymbol) {
      Toast({ type: "warning", message: "Please wait for your turn!" });
      return;
    }

    makeMoveOnBoard(row, col, currentPlayer);
  };

  const computerPlay = useCallback(() => {
    // Tìm tất cả các ô trống
    console.log("Computer's turn");
    if (isGameOver) return;
    if (currentPlayer === userSymbol) return;

    setIsComputerThinking(true);

    const emptyCells: { row: number; col: number }[] = [];
    gameBoard.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === "") {
          emptyCells.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    if (emptyCells.length > 0) {
      // Chọn ngẫu nhiên một ô trống
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const { row, col } = emptyCells[randomIndex];
      makeMoveOnBoard(row, col, currentPlayer);
    }

    setIsComputerThinking(false);
  }, [gameBoard, makeMoveOnBoard, currentPlayer, isGameOver]);

  // Gọi computerPlay khi đến lượt computer
  useEffect(() => {
    if (gameMode === "pvp") return; // PvP không có AI
    if (isGameOver) return;

    // goSecond mode: Computer chơi X trước
    if (gameMode === "goSecond" && currentPlayer === "X") {
      const timer = setTimeout(() => {
        computerPlay();
      }, 500);
      return () => clearTimeout(timer);
    }

    // goFirst mode: Computer chơi O (lượt thứ 2 trở đi)
    if (gameMode === "goFirst" && currentPlayer === "O") {
      const timer = setTimeout(() => {
        computerPlay();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, isGameOver, computerPlay, gameMode]);

  const resetBoard = useCallback(() => {
    setGameBoard(
      Array.from({ length: gameBoardSize?.rows ?? 0 }, () =>
        Array.from({ length: gameBoardSize?.cols ?? 0 }, () => ""),
      ),
    );
    setCurrentPlayer("X");
    setIsGameOver(false);
    setWinner(null);
    Toast({ type: "info", message: "Board reset!" });
  }, [gameBoardSize]);

  const saveGame = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/games/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken || ""}`,
        },
        body: JSON.stringify({
          game_id: "2",
          data: {
            boardSize: gameBoardSize,
            board: gameBoard,
            currentPlayer,
            isGameOver,
            winner,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save game");
      }

      Toast({ type: "success", title: "Success", message: "Game saved successfully" });
    } catch (error) {
      Toast({ type: "error", title: "Error", message: "Failed to save game" });
    }
  }, [gameBoardSize, gameBoard, currentPlayer, isGameOver, winner, accessToken]);

  // Hàm tải game từ localStorage
  const loadGame = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/games/load?game_id=2`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken || ""}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load game");
      }

      const gameData = await res.json();
      setGameBoard(gameData.data.data.board);
      setCurrentPlayer(gameData.data.data.currentPlayer);
      setIsGameOver(gameData.data.data.isGameOver);
      setWinner(gameData.data.data.winner);
      Toast({ type: "success", title: "Success", message: "Game loaded successfully" });
    } catch (error) {
      Toast({ type: "error", title: "Error", message: "Failed to load game" });
    }
  }, [setGameBoard, setCurrentPlayer, setIsGameOver, setWinner, accessToken]);

  const modesArt = {
    goFirst: `..........\n.XXX...X..\n.X..X.XX..\n.X..X..X..\n.XXX...X..\n.X.....X..\n.X.....X..\n.X.....X..\n.X....XXX.\n..........`,
    goSecond: `..........\n.OOO...O..\n.O..O.O.O.\n.O..O.O.O.\n.OOO....O.\n.O.....O..\n.O....O...\n.O....O...\n.O....OOO.\n..........`,
    pvp: `..........\n.X..X.OO..\n.X..XO..O.\n.X..XO..O.\n..X.X.O...\n..X.X..O..\n..X.XO..O.\n...XXO..O.\n....X.OO..\n..........`,
  };

  // Create modeBoard for visualization
  const createModesBoard = () => {
    const modesList = ["goFirst", "goSecond", "pvp"] as const;
    return modesList.map((mode) => {
      const art = modesArt[mode].trim().split("\n");
      return art.map((line) =>
        line.split("").map((char) => {
          if (char === ".") return "";
          if (char === "X") return color["X"];
          if (char === "O") return color["O"];
          return "";
        }),
      );
    });
  };

  const modesBoards = createModesBoard();

  const leftPanelContent = (
    <div>
      <h3 className={styles["game-title"]}>CARO 4</h3>
      <div className={styles["player-turn-indicator"]}>
        <p>Match 4 in a row to win.</p>
      </div>
    </div>
  );

  const rightPanelContent = gameMode ? (
    <div className={styles["player-turn-indicator"]} style={{ textAlign: "center" }}>
      <h3>Score</h3>
      <p style={{ fontSize: "24px", fontWeight: "bold", color: "#22c55e" }}>{score}</p>
      <hr style={{ margin: "1rem 0", borderColor: "#444" }} />
      {!isGameOver ? (
        <div>
          <h4>Current Turn</h4>
          <p style={{ fontSize: "18px", fontWeight: "bold" }}>
            {gameMode === "pvp" ? `Current Player: ` : `Your symbol: ${userSymbol} | Current: `}
            <span style={{ color: color[currentPlayer] }}>{currentPlayer}</span>
          </p>
        </div>
      ) : (
        <div>
          <h4>Game Over</h4>
          {winner ? (
            <p style={{ fontSize: "18px", fontWeight: "bold", color: color[winner] }}>
              {gameMode === "pvp"
                ? `${winner} wins!`
                : winner === userSymbol
                  ? "You win!"
                  : "You lose!"}
            </p>
          ) : (
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>It's a draw!</p>
          )}
        </div>
      )}
    </div>
  ) : (
    <div className={styles["player-turn-indicator"]} style={{ textAlign: "center" }}>
      <h3>Select Game Mode</h3>
      <p style={{ marginBottom: "10px" }}>Use &larr; &rarr; to navigate, Enter to select</p>
      <h2 style={{ color: "#22c55e" }}>{modes[selectedModeIndex].label}</h2>
      <p style={{ fontSize: "14px", color: "#888" }}>{modes[selectedModeIndex].description}</p>
    </div>
  );

  return (
    <div className={styles["game-page"]} style={{ flexDirection: "column" }}>
      
        <div className={styles["game-options-menu"]}>
          <button
            className={styles["reset-board-button"]}
            onClick={() => handleReturnButton()}
          >
            Return
          </button>
          {gameMode && (
            <div>
              <button className={styles["reset-board-button"]} onClick={saveGame}>
                Save Game
              </button>
              <button className={styles["reset-board-button"]} onClick={loadGame}>
                Load Game
              </button>
              <button className={styles["reset-board-button"]} onClick={resetBoard}>
                Reset Board
              </button>
            </div>
          )}
        </div>

      {/* Hiển thị trạng thái game */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      ></div>

      <GameZone
        gameBoard={gameMode ? gameBoard : modesBoards[selectedModeIndex]}
        handleCellClick={handleCellClick}
        leftPanelContent={leftPanelContent}
        rightPanelContent={rightPanelContent}
      />
    </div>
  );
};

export default Caro4Content;

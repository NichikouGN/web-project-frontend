import { useCallback, useState, useEffect, use } from "react";
import styles from "../0-css/games.module.css";
import { Toast } from "../../../stores/toastStore";
import GameZone from "../GameZone/GameZone";
import { useAuthStore } from "../../../stores/authStore";
import { postGameResult } from "../../../api/games.api";
import { useNavigate } from "react-router-dom";
import { number, set } from "zod";
  
interface Match3ContentProps {
  gameBoard: string[][];
  setGameBoard: React.Dispatch<React.SetStateAction<string[][]>>;
  gameBoardSize?: { rows: number; cols: number };
  setGameState?: React.Dispatch<
    React.SetStateAction<"unloaded" | "loadError" | "fetchError" | "loaded">
  >;
  isGameOver?: boolean;
  setIsGameOver?: React.Dispatch<React.SetStateAction<boolean>>;
  timer: number;
}

const Match3Content = ({
  gameBoard,
  setGameBoard,
  gameBoardSize,
  setGameState,
  isGameOver: propsIsGameOver = false,
  setIsGameOver: propsSetIsGameOver,
  timer,
}: Match3ContentProps) => {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [score, setScore] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [gameMode, setGameMode] = useState<"classic" | "timeAttack" | "endless" | null>(null);
  const [selectedModeIndex, setSelectedModeIndex] = useState(0);
  const [turnsLeft, setTurnsLeft] = useState(30);
  const [timeLeft, setTimeLeft] = useState(timer);
  const [isGameOver, setIsGameOver] = useState(propsIsGameOver);
  const [playTime, setPlayTime] = useState(0);
  const colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink"];

  const modes = [
    {
      id: "classic",
      label: "Classic",
      description: "Score as much as possible with limited turn count",
    },
    {
      id: "timeAttack",
      label: "Time Attack",
      description: "Score as much as possible in 60 seconds",
    },
    { id: "endless", label: "Endless", description: "Play endlessly, no scoring" },
  ];

  const modesArt = {
    classic: `..........\n..PP..RR..\n..PP..RR..\n..........\n....RRGG..\n....RRGG..\n..........\n..BB..RR..\n..BB..RR..\n..........`,
    timeAttack: `..........\n..YYYYYY..\n..Y....Y..\n...Y..Y...\n....YY....\n....YY....\n...Y..Y...\n..Y....Y..\n..YYYYYY..\n..........`,
    endless: `..........\n..........\n..........\n..RO..BB..\n.R..OP..G.\n.R..PO..G.\n..II..YY..\n..........\n..........\n..........`,
  };

  const createModesBoard = () => {
    const modesList = ["classic", "timeAttack", "endless"] as const;
    return modesList.map((mode) => {
      const art = modesArt[mode].trim().split("\n");
      return art.map((line) =>
        line.split("").map((char) => {
          if (char === ".") return "";
          if (char === "R") return "red";
          if (char === "B") return "blue";
          if (char === "G") return "green";
          if (char === "Y") return "yellow";
          if (char === "P") return "purple";
          if (char === "O") return "orange";
          if (char === "I") return "pink";
          return "";
        }),
      );
    });
  };

  const modesBoards = createModesBoard();

  const generateGameArray = useCallback(() => {
    if (!gameBoardSize) return;

    const createBoardWithoutMatches = (): string[][] => {
      let board = Array.from({ length: gameBoardSize.rows }, () =>
        Array.from({ length: gameBoardSize.cols }, () => {
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          return randomColor;
        }),
      );

      // Kiểm tra và xóa matches cho đến khi không còn
      let hasMatchFound = true;
      while (hasMatchFound) {
        hasMatchFound = false;
        const toReplace = new Set<string>();

        // Kiểm tra horizontal matches
        for (let row = 0; row < board.length; row++) {
          for (let col = 0; col < board[row].length; col++) {
            const color = board[row][col];
            if (color === "") continue;

            let matchCount = 1;
            for (let nextCol = col + 1; nextCol < board[row].length; nextCol++) {
              if (board[row][nextCol] === color) {
                matchCount++;
              } else {
                break;
              }
            }

            if (matchCount >= 3) {
              hasMatchFound = true;
              for (let i = 0; i < matchCount; i++) {
                toReplace.add(`${row}-${col + i}`);
              }
            }
          }
        }

        // Kiểm tra vertical matches
        for (let col = 0; col < board[0].length; col++) {
          for (let row = 0; row < board.length; row++) {
            const color = board[row][col];
            if (color === "") continue;

            let matchCount = 1;
            for (let nextRow = row + 1; nextRow < board.length; nextRow++) {
              if (board[nextRow][col] === color) {
                matchCount++;
              } else {
                break;
              }
            }

            if (matchCount >= 3) {
              hasMatchFound = true;
              for (let i = 0; i < matchCount; i++) {
                toReplace.add(`${row + i}-${col}`);
              }
            }
          }
        }

        // Thay đổi màu các cells match thành màu ngẫu nhiên khác
        toReplace.forEach((key) => {
          const [row, col] = key.split("-").map(Number);
          let newColor = colors[Math.floor(Math.random() * colors.length)];
          // Đảm bảo màu mới khác với màu cũ
          while (newColor === board[row][col]) {
            newColor = colors[Math.floor(Math.random() * colors.length)];
          }
          board[row][col] = newColor;
        });
      }

      return board;
    };

    const newArray = createBoardWithoutMatches();
    setGameBoard(newArray);
  }, [gameBoardSize, colors, setGameBoard]);

  useEffect(() => {
    if (gameMode) {
      generateGameArray();
    }
  }, [gameMode, gameBoardSize]);

  // Mode selector keyboard handler
  useEffect(() => {
    if (gameMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedModeIndex((prev) => (prev === 0 ? modes.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedModeIndex((prev) => (prev === modes.length - 1 ? 0 : prev + 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selectedMode = modes[selectedModeIndex].id as "classic" | "timeAttack" | "endless";
        setGameMode(selectedMode);
        setTurnsLeft(15);
        setTimeLeft(timer);
        setIsGameOver(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModeIndex, gameMode, modes]);

  // Đếm thời gian chơi
  useEffect(() => {
    if (isGameOver || !gameMode) return;
    const timer = setInterval(() => {
      setPlayTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, gameMode]);

  // Post game result khi game kết thúc (không post cho endless mode)
  useEffect(() => {
    if (!isGameOver || gameMode === "endless" || !gameMode || playTime === 0) return;

    const postResult = async () => {
      try {
        await postGameResult(5, score, playTime, accessToken);
        
        // Gọi API increment match count
        fetch(`${import.meta.env.VITE_API_URL}/api/user-stats/increment-match`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken || ""}`,
          },
        }).catch((error) => {
          console.error("Failed to increment match count:", error);
        });

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

  // Timer countdown cho Time Attack mode
  useEffect(() => {
    if (gameMode !== "timeAttack" || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setIsGameOver(true);
          Toast({
            type: "error",
            title: "Time's Up!",
            message: "Time Attack mode ended!",
          });
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode, isGameOver]);

  const checkAndClearMatches = useCallback(() => {
    const processCascade = (board: string[][], iteration: number = 0) => {
      setTimeout(() => {
        setGameBoard((currentBoard) => {
          const newBoard = currentBoard.map((r) => [...r]);
          const toRemove = new Set<string>();

          // Kiểm tra horizontal matches (3+ cells cùng màu liên tiếp ngang)
          for (let row = 0; row < newBoard.length; row++) {
            for (let col = 0; col < newBoard[row].length; col++) {
              const color = newBoard[row][col];
              if (color === "") continue;

              let matchCount = 1;
              // Đếm sang phải
              for (let nextCol = col + 1; nextCol < newBoard[row].length; nextCol++) {
                if (newBoard[row][nextCol] === color) {
                  matchCount++;
                } else {
                  break;
                }
              }

              // Nếu có 3+ cells cùng màu, đánh dấu để xóa
              if (matchCount >= 3) {
                for (let i = 0; i < matchCount; i++) {
                  toRemove.add(`${row}-${col + i}`);
                }
              }
            }
          }

          // Kiểm tra vertical matches (3+ cells cùng màu liên tiếp dọc)
          for (let col = 0; col < newBoard[0].length; col++) {
            for (let row = 0; row < newBoard.length; row++) {
              const color = newBoard[row][col];
              if (color === "") continue;

              let matchCount = 1;
              // Đếm xuống dưới
              for (let nextRow = row + 1; nextRow < newBoard.length; nextRow++) {
                if (newBoard[nextRow][col] === color) {
                  matchCount++;
                } else {
                  break;
                }
              }

              // Nếu có 3+ cells cùng màu, đánh dấu để xóa
              if (matchCount >= 3) {
                for (let i = 0; i < matchCount; i++) {
                  toRemove.add(`${row + i}-${col}`);
                }
              }
            }
          }

          // Nếu có match, xóa và tiếp tục
          if (toRemove.size > 0) {
            // Xóa các cells đã match
            toRemove.forEach((key) => {
              const [row, col] = key.split("-").map(Number);
              newBoard[row][col] = "";
            });

            const scoreBonus = (a: number, b: number) => {
              let sum = 0;
              for (let i = a; i <= b; i++) {
                sum += (i - 3) * 5;
              }
              return sum;
            };
            let scoreIncrement = toRemove.size * 10;
            if (toRemove.size > 3) {
              // Bonus điểm nếu xóa nhiều hơn 3 cells cùng lúc
              scoreIncrement += scoreBonus(4, toRemove.size);
            }

            // Cập nhật score dựa trên số lượng matches
            setScore((prev) => prev + scoreIncrement);
            // Drop các ô từ trên xuống để lấp chỗ trống
            for (let c = 0; c < newBoard[0].length; c++) {
              let writePos = newBoard.length - 1;
              for (let r = newBoard.length - 1; r >= 0; r--) {
                if (newBoard[r][c] !== "") {
                  newBoard[writePos][c] = newBoard[r][c];
                  if (writePos !== r) {
                    newBoard[r][c] = "";
                  }
                  writePos--;
                }
              }
            }

            // Tạo các ô mới random ở phía trên
            for (let c = 0; c < newBoard[0].length; c++) {
              for (let r = 0; r < newBoard.length; r++) {
                if (newBoard[r][c] === "") {
                  const randomColor = colors[Math.floor(Math.random() * colors.length)];
                  newBoard[r][c] = randomColor;
                }
              }
            }

            // Tiếp tục kiểm tra chain reaction
            processCascade(newBoard, iteration + 1);
          }

          return newBoard;
        });
      }, iteration * 300);
    };

    processCascade(gameBoard);
  }, [gameBoard, colors]);

  const isAdjacent = (row1: number, col1: number, row2: number, col2: number) => {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const hasMatch = (board: string[][]): boolean => {
    // Kiểm tra horizontal matches
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const color = board[row][col];
        if (color === "") continue;

        let matchCount = 1;
        for (let nextCol = col + 1; nextCol < board[row].length; nextCol++) {
          if (board[row][nextCol] === color) {
            matchCount++;
          } else {
            break;
          }
        }

        if (matchCount >= 3) return true;
      }
    }

    // Kiểm tra vertical matches
    for (let col = 0; col < board[0].length; col++) {
      for (let row = 0; row < board.length; row++) {
        const color = board[row][col];
        if (color === "") continue;

        let matchCount = 1;
        for (let nextRow = row + 1; nextRow < board.length; nextRow++) {
          if (board[nextRow][col] === color) {
            matchCount++;
          } else {
            break;
          }
        }

        if (matchCount >= 3) return true;
      }
    }

    return false;
  };

  const handleCellClick = (row: number, col: number) => {
    // Không cho chơi nếu chưa chọn mode
    if (!gameMode) return;
    if (isGameOver) return;

    if (!selectedCell) {
      // Chưa có cell nào được chọn, chọn cell được click
      setSelectedCell({ row, col });
    } else {
      // Đã có cell được chọn
      if (selectedCell.row === row && selectedCell.col === col) {
        // Click vào cell đã chọn, bỏ chọn
        setSelectedCell(null);
      } else if (isAdjacent(selectedCell.row, selectedCell.col, row, col)) {
        // Cell kề với cell được chọn, swap 2 cell
        setGameBoard((prevBoard) => {
          const newBoard = prevBoard.map((r) => [...r]);
          const temp = newBoard[selectedCell.row][selectedCell.col];
          newBoard[selectedCell.row][selectedCell.col] = newBoard[row][col];
          newBoard[row][col] = temp;

          // Kiểm tra nếu có match sau swap
          if (hasMatch(newBoard)) {
            // Có match, giữ swap này
            return newBoard;
          } else {
            // Không có match, swap lại
            const revertBoard = prevBoard.map((r) => [...r]);
            return revertBoard;
          }
        });

        setSelectedCell(null);

        // Kiểm tra match sau khi swap (nếu có) - với delay để thấy animation
        setTimeout(() => {
          setGameBoard((currentBoard) => {
            if (hasMatch(currentBoard)) {
              checkAndClearMatches();
              // Giảm turns cho classic mode
              if (gameMode === "classic") {
                setTurnsLeft((prev) => {
                  const newTurns = prev - 1;
                  if (newTurns <= 0) {
                    setIsGameOver(true);
                    Toast({
                      type: "info",
                      title: "Game Over",
                      message: "No more turns!",
                    });
                  }
                  return newTurns;
                });
              }
            }
            return currentBoard;
          });
        }, 300);
      } else {
        // Cell không kề, gán cell được click thành cell được chọn mới
        setSelectedCell({ row, col });
      }
    }
  };

  const resetBoard = useCallback(() => {
    generateGameArray();
    setScore(0);
    setTurnsLeft(30);
    setTimeLeft(timer);
    setIsGameOver(false);
    setSelectedCell(null);
  }, [generateGameArray]);

  const saveGame = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/games/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken || ""}`,
        },
        body: JSON.stringify({
          game_id: "5",
          data: {
            boardSize: gameBoardSize,
            board: gameBoard,
            score: score,
            turnsLeft: turnsLeft,
            timeLeft: timeLeft,
            gameMode: gameMode,
            isGameOver: isGameOver,
            selectedCell: selectedCell,
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
  }, [
    gameBoardSize,
    gameBoard,
    score,
    turnsLeft,
    timeLeft,
    gameMode,
    isGameOver,
    selectedCell,
    accessToken,
  ]);

  const loadGame = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/games/load?game_id=5`, {
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
      const data = gameData?.data?.data ?? {};
      setGameBoard(data.board || gameBoard);
      setScore(data.score ?? 0);
      setTurnsLeft(data.turnsLeft ?? 30);
      setTimeLeft(data.timeLeft ?? timer);
      setGameMode(data.gameMode ?? null);
      setIsGameOver(data.isGameOver ?? false);
      setSelectedCell(data.selectedCell ?? null);

      // Sync mode selector index for UI highlighting
      if (data.gameMode) {
        const foundIndex = modes.findIndex((m) => m.id === data.gameMode);
        if (foundIndex !== -1) {
          setSelectedModeIndex(foundIndex);
        }
      }

      Toast({ type: "success", title: "Success", message: "Game loaded successfully" });
    } catch (error) {
      Toast({ type: "error", title: "Error", message: "Failed to load game" });
    }
  }, [accessToken, modes, gameBoard]);

  const leftPanelContent = gameMode ? (
    <div style={{ textAlign: "center" }} className={styles["player-turn-indicator"]}>
      <h3 className={styles["game-title"]}>MATCH 3</h3>
      <h3>Instructions</h3>
      <p style={{ fontSize: "16px", lineHeight: "1.4" }}>
        Click a tile to select it, then click an adjacent tile to swap them.
      </p>
      <p style={{ fontSize: "14px", color: "#888" }}>
        Match 3+ of a color in a row or column to clear them.
      </p>
    </div>
  ) : (
    <div style={{ textAlign: "center" }} className={styles["player-turn-indicator"]}>
      <h3 className={styles["game-title"]}>MATCH 3</h3>
      <p style={{ fontSize: "14px", color: "#888" }}>Select your preferred game mode</p>
    </div>
  );

  const rightPanelContent = gameMode ? (
    <div style={{ textAlign: "center" }}>
      <div className={styles["player-turn-indicator"]}>
        {gameMode === "endless" ? (
          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#888" }}>Playing Endless</p>
        ) : (
          <>
            <h3>Score</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#22c55e" }}>{score}</p>
            <hr style={{ margin: "1rem 0", borderColor: "#444" }} />
            {gameMode === "classic" && (
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: turnsLeft <= 3 ? "#FF6B6B" : "#FFC107",
                }}
              >
                Turns: {turnsLeft}
              </p>
            )}
            {gameMode === "timeAttack" && (
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: timeLeft <= 10 ? "#FF6B6B" : "#FFC107",
                }}
              >
                Time: {timeLeft}s
              </p>
            )}
          </>
        )}
      </div>
    </div>
  ) : (
    <div className={styles["player-turn-indicator"]} style={{ textAlign: "center" }}>
      <h3>Select Game Mode</h3>
      <p style={{ marginBottom: "10px" }}>Use &larr; &rarr; to navigate, Enter to select</p>
      <h2 style={{ color: "#22c55e" }}>{modes[selectedModeIndex].label}</h2>
      <p style={{ fontSize: "14px", color: "#888" }}>{modes[selectedModeIndex].description}</p>
    </div>
  );

  const handleReturnButton = () => {
    if (gameMode) {
      setGameState && setGameState("unloaded");
      setGameMode(null);
    } else {
      navigate("/"); 
    }
  };

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
      
      <GameZone
        gameBoard={gameMode ? gameBoard : modesBoards[selectedModeIndex]}
        handleCellClick={handleCellClick}
        selectedCell={selectedCell}
        leftPanelContent={leftPanelContent}
        rightPanelContent={rightPanelContent}
      />
    </div>
  );
};

export default Match3Content;

import { useCallback, useState, useEffect } from "react";
import styles from "../0-css/games.module.css";
import { Toast } from "../../../stores/toastStore";
import { set } from "zod";
import GameZone from "../GameZone/GameZone";
import { useAuthStore } from "../../../stores/authStore";
import { postGameResult } from "../../../api/games.api";
import { useNavigate } from "react-router-dom";
import HelpPopup from "../../../components/HelpPopup/HelpPopup";
import snakeHelp from "../../../assets/snake-dark.png";
import { fetchWithAuth } from "../../../api/fetchWithAuth";

interface SnakeContentProps {
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

const SnakeContent = ({
  gameBoard,
  setGameBoard,
  gameBoardSize,
  setGameState,
  isGameOver: propsIsGameOver = false,
  setIsGameOver: propsSetIsGameOver,
  timer,
}: SnakeContentProps) => {
  // Sử dụng props từ parent nếu có, nếu không dùng local state
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();
  const [isGameOver, setIsGameOver] = useState(propsIsGameOver);
  const [applePlaced, setApplePlaced] = useState(false);
  const [direction, setDirection] = useState<{ row: number; col: number }>({ row: 0, col: 1 }); // Hướng di chuyển (0,1) = phải
  const [nextDirection, setNextDirection] = useState<{ row: number; col: number }>({
    row: 0,
    col: 1,
  }); // Hướng sắp tới (để tránh quay 180 độ)
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState<Array<{ row: number; col: number }>>([]);
  const [snakeLength, setSnakeLength] = useState(4);
  const [speed, setSpeed] = useState(900); // Tốc độ di chuyển của rắn (ms)
  const [gameMode, setGameMode] = useState<"classic" | "timeAttack" | null>(null);
  const [selectedModeIndex, setSelectedModeIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timer); // 60 giây cho time attack
  const [playTime, setPlayTime] = useState(0);
  const [resPosted, setResPosted] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const modes = [
    { id: "classic", label: "Classic", description: "Classic mode" },
    {
      id: "timeAttack",
      label: "Time Attack",
      description: "Start with high speed, eat as much as you can",
    },
  ];

  // Màu sắc
  const colors = {
    snakeBody: "#00FF00", // Lime xanh sáng
    snakeHead: "#FFD700", // Gold/Vàng sáng
    apple: "red",
  };

  // Mode selector art - placeholder (sẽ được thêm sau)
  const modesArt = {
    classic: `..........\n.ssssssss.\n.s......s.\n.s.sS.A.s.\n.s.s....s.\n.s.s....s.\n.s.ssssss.\n.s........\n.ssssssss.\n..........`,
    timeAttack: `..........\n..SSSSSS..\n..S....S..\n...S..S...\n....SS....\n....SS....\n...S..S...\n..S....S..\n..SSSSSS..\n..........`,
  };

  const handleReturnButton = () => {
    if (gameMode) {
      setGameState && setGameState("unloaded");
      setGameMode(null);
      setResPosted(false);
    } else {
      navigate("/");
    }
  };

  const handleHelpButton = () => {
    setIsHelpOpen(true);
  };

  const handleEnter = () => {
    const selectedMode = modes[selectedModeIndex].id as "classic" | "timeAttack";
    setGameMode(selectedMode);

    // Khởi tạo tốc độ dựa trên mode
    if (selectedMode === "timeAttack") {
      setSpeed(400); // Tốc độ cao cho time attack
      setTimeLeft(timer); // Reset timer cho time attack
    } else {
      setSpeed(900); // Tốc độ thường cho classic
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
        handleEnter();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleReturnButton();
      } else if (e.key.toLowerCase() === "h") {
        e.preventDefault();
        handleHelpButton();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModeIndex, gameMode, modes, timer, handleReturnButton]);

  useEffect(() => {
    if (!gameMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleReturnButton();
      } else if (e.key.toLowerCase() === "h") {
        e.preventDefault();
        handleHelpButton();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleReturnButton, handleHelpButton]);

  // Đếm thời gian chơi
  useEffect(() => {
    if (isGameOver || !gameMode) return;
    const timer = setInterval(() => {
      setPlayTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, gameMode]);

  // Post game result khi game kết thúc
  useEffect(() => {
    if (!isGameOver || !gameMode || playTime === 0 || resPosted) return;

    const postResult = async () => {
      try {
        await postGameResult(4, score, playTime, accessToken);

        // Gọi API increment match count
        fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/user-stats/increment-match`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
    setResPosted(true);
  }, [isGameOver, gameMode, score, playTime, accessToken, resPosted]);

  // Create modeBoard for visualization
  const createModesBoard = () => {
    const modesList = ["classic", "timeAttack"] as const;
    return modesList.map((mode) => {
      const art = modesArt[mode].trim().split("\n");
      return art.map((line) =>
        line.split("").map((char) => {
          if (char === ".") return "";
          if (char === "S") return colors.snakeHead;
          if (char === "s") return colors.snakeBody;
          if (char === "A") return colors.apple;
          return "";
        }),
      );
    });
  };

  const modesBoards = createModesBoard();

  const spawnApple = useCallback(() => {
    if (!gameBoardSize) return;
    const newBoard = gameBoard.map((row) => [...row]);
    let appleSpawned = false;
    while (!appleSpawned) {
      const randRow = Math.floor(Math.random() * gameBoardSize.rows);
      const randCol = Math.floor(Math.random() * gameBoardSize.cols);
      if (newBoard[randRow][randCol] === "") {
        newBoard[randRow][randCol] = colors.apple;
        appleSpawned = true;
      }
    }
    setApplePlaced(true);
    setGameBoard(newBoard);
  }, [gameBoardSize, gameBoard, setGameBoard, colors]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      return; // Không xử lý click khi đang chơi
    },
    [gameMode, gameBoard, spawnApple, setGameBoard, setIsGameOver],
  );

  useEffect(() => {
    if (gameBoardSize && !applePlaced) spawnApple();
  }, [gameBoardSize, applePlaced, spawnApple]);

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

  // Khởi tạo rắn và táo lần đầu
  useEffect(() => {
    if (!gameMode || !gameBoardSize || snake.length > 0) return;

    const initialSnake = [
      { row: Math.floor(gameBoardSize.rows / 2), col: Math.floor(gameBoardSize.cols / 2) + 1 },
      { row: Math.floor(gameBoardSize.rows / 2), col: Math.floor(gameBoardSize.cols / 2) },
      { row: Math.floor(gameBoardSize.rows / 2), col: Math.floor(gameBoardSize.cols / 2) - 1 },
      { row: Math.floor(gameBoardSize.rows / 2), col: Math.floor(gameBoardSize.cols / 2) - 2 },
    ];
    setSnake(initialSnake);
    setSnakeLength(4); // Rắn bắt đầu với độ dài 4

    // Vẽ rắn lên board rỗng
    const newBoard = Array.from({ length: gameBoardSize.rows }, () =>
      Array.from({ length: gameBoardSize.cols }, () => ""),
    );
    initialSnake.forEach((segment, index) => {
      // Đầu rắn có màu vàng, thân có màu xanh
      newBoard[segment.row][segment.col] = index === 0 ? colors.snakeHead : colors.snakeBody;
    });
    setGameBoard(newBoard);
    setApplePlaced(false); // Báo hiệu rằng táo cần được spawn
  }, [gameMode, gameBoardSize, colors]);

  // Xử lý phím bấm để thay đổi hướng
  useEffect(() => {
    if (!gameMode) return; // Chỉ handle khi đã chọn mode

    const handleKeyPress = (e: KeyboardEvent) => {
      if (isGameOver) return;

      switch (e.key) {
        case "ArrowUp":
          // Không cho quay 180 độ
          if (direction.row === 0) {
            setNextDirection({ row: -1, col: 0 });
          }
          e.preventDefault();
          break;
        case "ArrowDown":
          if (direction.row === 0) {
            setNextDirection({ row: 1, col: 0 });
          }
          e.preventDefault();
          break;
        case "ArrowLeft":
          if (direction.col === 0) {
            setNextDirection({ row: 0, col: -1 });
          }
          e.preventDefault();
          break;
        case "ArrowRight":
          if (direction.col === 0) {
            setNextDirection({ row: 0, col: 1 });
          }
          e.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction, isGameOver, gameMode]);

  // Di chuyển rắn mỗi 1 giây
  useEffect(() => {
    if (!gameMode || isGameOver || snake.length === 0) return;

    const moveSnake = () => {
      // Cập nhật hướng thực tế
      setDirection(nextDirection);

      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          row: head.row + nextDirection.row,
          col: head.col + nextDirection.col,
        };

        // Kiểm tra va chạm tường
        if (
          newHead.row < 0 ||
          newHead.row >= gameBoardSize!.rows ||
          newHead.col < 0 ||
          newHead.col >= gameBoardSize!.cols
        ) {
          Toast({ type: "error", message: "You hit the wall! Game Over!" });
          setIsGameOver(true);
          return prevSnake;
        }

        // Kiểm tra va chạm với thân rắn
        if (
          prevSnake.some((segment) => segment.row === newHead.row && segment.col === newHead.col)
        ) {
          Toast({ type: "error", message: "You hit yourself! Game Over!" });
          setIsGameOver(true);
          return prevSnake;
        }

        let newSnake = [newHead, ...prevSnake];
        let newBoardForApple: string[][] | null = null;

        // Kiểm tra ăn táo
        if (gameBoard[newHead.row][newHead.col] === colors.apple) {
          Toast({ type: "success", message: "Apple eaten! +1 score" });
          setScore((s) =>
            gameMode === "timeAttack" ? s + 100 + (1000 - speed) / 5 : s + 50 + (1000 - speed) / 10,
          ); // Tăng điểm dựa trên tốc độ hiện tại
          setSnakeLength((prev) => prev + 1); // Tăng độ dài rắn
          setSpeed((prev) =>
            gameMode === "timeAttack" ? Math.max(100, prev - 50) : Math.max(100, prev - 20),
          ); // Tăng tốc độ (giảm thời gian chờ, tối thiểu 100ms)
          // Spawn táo mới ngay lập tức
          const tempBoard = gameBoard.map((row) => [...row]);
          tempBoard[newHead.row][newHead.col] = ""; // Xóa táo cũ

          // Tìm vị trí trống để spawn táo mới
          let appleSpawned = false;
          let attempts = 0;
          while (!appleSpawned && attempts < 100) {
            const randRow = Math.floor(Math.random() * gameBoardSize!.rows);
            const randCol = Math.floor(Math.random() * gameBoardSize!.cols);
            if (tempBoard[randRow][randCol] === "") {
              tempBoard[randRow][randCol] = colors.apple;
              appleSpawned = true;
            }
            attempts++;
          }
          newBoardForApple = tempBoard;
        } else {
          // Xóa đuôi nếu không ăn táo (giữ độ dài theo snakeLength)
          if (newSnake.length > snakeLength) {
            newSnake = newSnake.slice(0, snakeLength);
          }
        }

        // Vẽ rắn lên board
        const newBoard = newBoardForApple ? newBoardForApple : gameBoard.map((row) => [...row]);

        // Xóa toàn bộ rắn cũ trên board
        for (let i = 0; i < newBoard.length; i++) {
          for (let j = 0; j < newBoard[i].length; j++) {
            if (newBoard[i][j] === colors.snakeBody || newBoard[i][j] === colors.snakeHead) {
              newBoard[i][j] = "";
            }
          }
        }

        // Xóa táo nếu rắn ăn nó (nếu chưa được xóa)
        if (gameBoard[newHead.row][newHead.col] === colors.apple && !newBoardForApple) {
          newBoard[newHead.row][newHead.col] = "";
        }

        // Vẽ rắn mới (chỉ vẽ đúng snakeLength segments)
        newSnake.slice(0, snakeLength).forEach((segment, index) => {
          // Segment đầu tiên (đầu rắn) dùng màu vàng, phần còn lại dùng màu xanh
          newBoard[segment.row][segment.col] = index === 0 ? colors.snakeHead : colors.snakeBody;
        });

        setGameBoard(newBoard);
        return newSnake;
      });
    };

    const timer = setInterval(moveSnake, speed);
    return () => clearInterval(timer);
  }, [
    snake,
    nextDirection,
    gameBoard,
    gameBoardSize,
    isGameOver,
    setGameBoard,
    setIsGameOver,
    snakeLength,
    colors,
    gameMode,
    speed,
  ]);

  const resetBoard = useCallback(() => {
    const emptyBoard = Array.from({ length: gameBoardSize?.rows ?? 0 }, () =>
      Array.from({ length: gameBoardSize?.cols ?? 0 }, () => ""),
    );

    // Khởi tạo lại rắn
    const initialSnake = [
      { row: Math.floor(gameBoardSize!.rows / 2), col: Math.floor(gameBoardSize!.cols / 2) + 1 },
      { row: Math.floor(gameBoardSize!.rows / 2), col: Math.floor(gameBoardSize!.cols / 2) },
      { row: Math.floor(gameBoardSize!.rows / 2), col: Math.floor(gameBoardSize!.cols / 2) - 1 },
      { row: Math.floor(gameBoardSize!.rows / 2), col: Math.floor(gameBoardSize!.cols / 2) - 2 },
    ];

    // Vẽ rắn lên board
    initialSnake.forEach((segment, index) => {
      emptyBoard[segment.row][segment.col] = index === 0 ? colors.snakeHead : colors.snakeBody;
    });

    setGameBoard(emptyBoard);
    setSnake(initialSnake);
    setSnakeLength(4);
    setDirection({ row: 0, col: 1 });
    setNextDirection({ row: 0, col: 1 });
    setScore(0);
    setSpeed(gameMode === "timeAttack" ? 400 : 900);
    setApplePlaced(false);
    setIsGameOver(false);
    setResPosted(false);

    if (gameMode === "timeAttack") {
      setTimeLeft(timer); // Reset timer cho time attack
    }
    Toast({ type: "info", message: "Board reset!" });
  }, [gameBoardSize, colors, gameMode, timer]);

  const saveGame = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/games/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_id: "4",
          data: {
            boardSize: gameBoardSize,
            board: gameBoard,
            snake: snake,
            direction: direction,
            nextDirection: nextDirection,
            snakeLength: snakeLength,
            score: score,
            speed: speed,
            isGameOver: isGameOver,
            applePlaced: applePlaced,
            timeLeft: timeLeft,
            gameMode: gameMode,
            selectedModeIndex: selectedModeIndex,
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
    snake,
    direction,
    nextDirection,
    snakeLength,
    score,
    speed,
    isGameOver,
    applePlaced,
    timeLeft,
    gameMode,
    selectedModeIndex,
    accessToken,
  ]);

  // Hàm tải game từ API
  const loadGame = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/games/load?game_id=4`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load game");
      }

      const gameData = await res.json();
      const data = gameData?.data?.data ?? {};

      setGameBoard(data.board || gameBoard);
      setIsGameOver(data.isGameOver ?? false);
      setDirection(data.direction ?? { row: 0, col: 1 });
      setNextDirection(data.nextDirection ?? { row: 0, col: 1 });
      setSnake(data.snake ?? []);
      setSnakeLength(data.snakeLength ?? 4);
      setScore(data.score ?? 0);
      setSpeed(data.speed ?? 900);
      setGameMode(data.gameMode ?? null);
      setSelectedModeIndex(data.selectedModeIndex ?? 0);
      setTimeLeft(data.timeLeft ?? timer);
      setApplePlaced(data.applePlaced ?? false);

      Toast({
        type: "success",
        title: "Success",
        message: "Game loaded successfully",
      });
    } catch (error) {
      Toast({
        type: "error",
        message: "Failed to load game",
      });
    }
  }, [accessToken, gameBoard]);

  return (
    <div className={styles["game-page"]} style={{ flexDirection: "column" }}>
      <div className={styles["game-options-menu"]}>
        <button className={styles["reset-board-button"]} onClick={() => handleReturnButton()}>
          Return
        </button>
        {gameMode ? (
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
        ) : (
          <button className={styles["game-play-prompt"]} onClick={() => handleEnter()}>
            Start Game
          </button>
        )}
        <button className={styles["reset-board-button"]} onClick={handleHelpButton}>
          Help
        </button>
      </div>

      <GameZone
        gameBoard={gameMode ? gameBoard : modesBoards[selectedModeIndex]}
        handleCellClick={handleCellClick}
        leftPanelContent={
          gameMode ? (
            <div style={{ textAlign: "center" }} className={styles["player-turn-indicator"]}>
              <h3 className={styles["game-title"]}>SNAKE GAME</h3>
              <p style={{ fontSize: "16px", lineHeight: "1.4" }}>
                Use Arrow Keys to control the snake.
              </p>
              <p style={{ fontSize: "14px", color: "#888" }}>
                Eat apples to grow and score points!
              </p>
              <p style={{ fontSize: "14px", color: "#C32B2B" }}>Don't hit walls or yourself!</p>
            </div>
          ) : (
            <div style={{ textAlign: "center" }} className={styles["player-turn-indicator"]}>
              <h3 className={styles["game-title"]}>SNAKE GAME</h3>
              <p style={{ fontSize: "14px", color: "#888" }}>Select your preferred game mode</p>
            </div>
          )
        }
        rightPanelContent={
          gameMode ? (
            <div>
              <div className={styles["player-turn-indicator"]} style={{ textAlign: "center" }}>
                <h3>Score</h3>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#22c55e" }}>{score}</p>
                <hr style={{ margin: "1rem 0", borderColor: "#444" }} />
                {gameMode === "timeAttack" && (
                  <>
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: timeLeft <= 10 ? "#FF6B6B" : "#FFC107",
                        marginBottom: "10px",
                      }}
                    >
                      Time: {timeLeft}s
                    </p>
                    <hr style={{ margin: "1rem 0", borderColor: "#444" }} />
                  </>
                )}
                <p>Length: {snake.length}</p>
                <p>Speed: {(1000 - speed) / 100}</p>
              </div>
            </div>
          ) : (
            <div className={styles["player-turn-indicator"]} style={{ textAlign: "center" }}>
              <h3>Select Game Mode</h3>
              <p style={{ marginBottom: "10px" }}>Use &larr; &rarr; to navigate, Enter to select</p>
              <h2 style={{ color: "#22c55e" }}>{modes[selectedModeIndex].label}</h2>
              <p style={{ fontSize: "14px", color: "#888" }}>
                {modes[selectedModeIndex].description}
              </p>
            </div>
          )
        }
      />

      <HelpPopup isOpen={isHelpOpen} imageUrl={snakeHelp} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default SnakeContent;

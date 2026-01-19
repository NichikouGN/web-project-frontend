import { useCallback, useState, useEffect } from "react";
import styles from "../0-css/games.module.css";
import { Toast } from "../../../stores/toastStore";
import GameZone from "../GameZone/GameZone";
import { useAuthStore } from "../../../stores/authStore";
import { postGameResult } from "../../../api/games.api";

interface FreePlayContentProps {
  gameBoard: string[][];
  setGameBoard: React.Dispatch<React.SetStateAction<string[][]>>;
  gameBoardSize?: { rows: number; cols: number };
  setGameState?: React.Dispatch<
    React.SetStateAction<"unloaded" | "loadError" | "fetchError" | "loaded">
  >;
  gameArray?: string[][];
  setGameArray?: React.Dispatch<React.SetStateAction<string[][]>>;
  matchedCount?: number;
  setMatchedCount?: React.Dispatch<React.SetStateAction<number>>;
  turnCount?: number;
  setTurnCount?: React.Dispatch<React.SetStateAction<number>>;
  isGameComplete?: boolean;
  setIsGameComplete?: React.Dispatch<React.SetStateAction<boolean>>;
  matchedCells?: Set<string>;
  setMatchedCells?: React.Dispatch<React.SetStateAction<Set<string>>>;
  isFirstSelection?: boolean;
  setIsFirstSelection?: React.Dispatch<React.SetStateAction<boolean>>;
  firstSelection?: { row: number; col: number } | null;
  setFirstSelection?: React.Dispatch<React.SetStateAction<{ row: number; col: number } | null>>;
  isWaiting?: boolean;
  setIsWaiting?: React.Dispatch<React.SetStateAction<boolean>>;
  timer: number;
}

const MemoryMatchingContent = ({
  gameBoard,
  setGameBoard,
  gameBoardSize,
  setGameState,
  gameArray: propsGameArray = [],
  setGameArray: propsSetGameArray,
  matchedCount: propsMatchedCount = 0,
  setMatchedCount: propsSetMatchedCount,
  turnCount: propsTurnCount = 0,
  setTurnCount: propsSetTurnCount,
  isGameComplete: propsIsGameComplete = false,
  setIsGameComplete: propsSetIsGameComplete,
  matchedCells: propsMatchedCells = new Set(),
  setMatchedCells: propsSetMatchedCells,
  isFirstSelection: propsIsFirstSelection = true,
  setIsFirstSelection: propsSetIsFirstSelection,
  firstSelection: propsFirstSelection = null,
  setFirstSelection: propsSetFirstSelection,
  isWaiting: propsIsWaiting = false,
  setIsWaiting: propsSetIsWaiting,
  timer,
}: FreePlayContentProps) => {
  // Sử dụng props từ parent nếu có, nếu không dùng local state
  const accessToken = useAuthStore((state) => state.accessToken);
  const [gameArray, setGameArray] = useState<string[][]>(propsGameArray);
  const [isFirstSelection, setIsFirstSelection] = useState<boolean>(propsIsFirstSelection);
  const [firstSelection, setFirstSelection] = useState<{ row: number; col: number } | null>(propsFirstSelection);
  const [matchedCount, setMatchedCount] = useState<number>(propsMatchedCount);
  const [turnCount, setTurnCount] = useState<number>(propsTurnCount);
  const [isGameComplete, setIsGameComplete] = useState<boolean>(propsIsGameComplete);
  const [isWaiting, setIsWaiting] = useState<boolean>(propsIsWaiting);
  const [matchedCells, setMatchedCells] = useState<Set<string>>(propsMatchedCells);
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState<"classic" | "timeAttack" | null>(null);
  const [selectedModeIndex, setSelectedModeIndex] = useState(0);
  
  const cellCount = gameBoardSize ? gameBoardSize.rows * gameBoardSize.cols : 0;
  const timeLimit = timer;

  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isGameOver, setIsGameOver] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  
  const modes = [
    { id: "classic", label: "Classic", description: "Scoring when match, penalty when fail" },
    { id: "timeAttack", label: `Time Attack (${timeLimit}s)`, description: "Score before time runs out, penalty for unmatched pairs" },
  ];
  const reward = 100 + (gameBoardSize ? gameBoardSize.rows * gameBoardSize.cols * 20 : 0); // điểm thưởng khi ghép đúng
  const penalty = 10;  // điểm phạt khi ghép sai

  const modesArt = {
    "classic":
      `CCC...\nCCC...\nCCCBBB\nCCCBBB\n...BBB\n...BBB`,
    "timeAttack":
      `YYYYYY\n.Y..Y.\n..YY..\n..YY..\n.Y..Y.\nYYYYYY`
  };

  // Create modeBoard for visualization
  const createModesBoard = () => {
      const modesList = ["classic", "timeAttack"] as const;
      return modesList.map((mode) => {
          const art = modesArt[mode].trim().split("\n");
          return art.map((line) =>
              line.split("").map((char) => {
                  if (char === ".") return "";
                  if (char === "C") return "#33F5FF";
                  if (char === "B") return "#3357FF";
                  if (char === "Y") return "#FFD700";
                  return "";
              })
          );
      });
  };

  const modesBoards = createModesBoard();

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
        const selectedMode = modes[selectedModeIndex].id as "classic" | "timeAttack";
        setGameMode(selectedMode);
        setTimeLeft(timeLimit);
        setIsGameOver(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModeIndex, gameMode, modes]);

  // Đếm thời gian chơi
  useEffect(() => {
    if (isGameOver || isGameComplete || !gameMode) return;
    const timer = setInterval(() => {
      setPlayTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, isGameComplete, gameMode]);

  // Post game result khi game kết thúc
  useEffect(() => {
    if ((!isGameOver && !isGameComplete) || !gameMode || playTime === 0) return;

    const postResult = async () => {
      try {
        await postGameResult(6, score, playTime, accessToken);
        Toast({ 
          type: "success", 
          title: "Game Recorded", 
          message: "Your game record has been saved!" 
        });
      } catch (error) {
        console.error("Failed to post game result:", error);
        // Toast is already shown by postGameResult function
      }
    };

    postResult();
  }, [isGameOver, isGameComplete, gameMode, score, accessToken]);

  // Timer countdown cho Time Attack mode
  useEffect(() => {
    if (gameMode !== "timeAttack" || isGameOver || isGameComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setIsGameOver(true);
          // Tính penalty cho số cặp chưa match
          const totalPairs = gameBoardSize ? (gameBoardSize.rows * gameBoardSize.cols) / 2 : 0;
          const unmatchedPairs = totalPairs - matchedCount;
          const finalPenalty = unmatchedPairs * 10;
          setScore((prev) => Math.max(0, prev - finalPenalty));
          Toast({ 
            type: "error", 
            title: "Time's Up!", 
            message: `Penalty: ${finalPenalty} points for ${unmatchedPairs} unmatched pairs` 
          });
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode, isGameOver, isGameComplete, matchedCount, gameBoardSize]);

  const updateCellColor = (row: number, col: number, color: string) => {
    setGameBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      newBoard[row][col] = color;
      return newBoard;
    });
  };

  const generateGameArray = useCallback(() => {
    if (!gameBoardSize) return [];

    const { rows, cols } = gameBoardSize;
    const totalCells = rows * cols;

    // Kiểm tra số ô phải là số chẵn (để tạo cặp)
    if (totalCells % 2 !== 0) {
      Toast({ type: "error", message: "Board size must have even number of cells" });
      return [];
    }

    // Danh sách màu để gán cho các cặp
    const colors = [
      "#FF5733", "#33FF57", "#3357FF", "#FF33F5", 
      "#33F5FF", "#FFD700", "#FF8C00", "#20B2AA",
      "#FFB6C1", "#90EE90", "#87CEEB", "#DDA0DD",
      "#F0E68C", "#FF1493", "#00CED1", "#32CD32",
      "#FF69B4", "#4169E1", "#00FF00", "#FF0000"
    ];

    const numPairs = totalCells / 2;

    // Tạo mảng các cặp: [0, 0, 1, 1, 2, 2, ...]
    const pairs: number[] = [];
    for (let i = 0; i < numPairs; i++) {
      pairs.push(i);
      pairs.push(i);
    }

    // Shuffle mảng cặp
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    // Tạo ma trận từ mảng pairs
    const gameArray: string[][] = [];
    let pairIndex = 0;
    for (let i = 0; i < rows; i++) {
      const row: string[] = [];
      for (let j = 0; j < cols; j++) {
        const pairId = pairs[pairIndex];
        const color = colors[pairId % colors.length];
        row.push(color);
        pairIndex++;
      }
      gameArray.push(row);
    }
    return gameArray;
  }, [gameBoardSize]);

  if (gameArray.length === 0 && gameBoardSize) {
    const newGameArray = generateGameArray();
    setGameArray(newGameArray);
  }

  const handleOnClick = (row: number, col: number) => {
    // Không cho chơi nếu chưa chọn mode
    if (!gameMode) return;
    if (isGameOver) return;

    if (firstSelection && firstSelection.row === row && firstSelection.col === col) {
      Toast({ type: "warning", message: "Please select another cell" });
      return;
    }

    // Nếu gameArray chưa được tạo, tạo nó
    if (gameArray.length === 0) {
      const newGameArray = generateGameArray();
      setGameArray(newGameArray);
    }

    // Không cho phép chọn khi đang chờ hoặc ô đã matched hoặc game complete
    if (isWaiting || isGameComplete) {
      Toast({ type: "warning", message: "Please wait..." });
      return;
    }

    // Kiểm tra nếu ô đã được matched
    const cellKey = `${row}-${col}`;
    if (matchedCells.has(cellKey)) {
      Toast({ type: "warning", message: "Already matched!" });
      return;
    }

    if (isFirstSelection) {
      // Lựa chọn đầu tiên
      const selectedColor = gameArray[row][col];
      updateCellColor(row, col, selectedColor);
      setFirstSelection({ row, col });
      setIsFirstSelection(false);
    } else {
      // Lựa chọn thứ hai
      const selectedColor = gameArray[row][col];
      updateCellColor(row, col, selectedColor);
      
      if (firstSelection) {
        const firstColor = gameArray[firstSelection.row][firstSelection.col];
        
        // Bật trạng thái waiting
        setIsWaiting(true);
        
        if (firstColor !== selectedColor) {
          // Không khớp, ẩn lại sau 1 giây
          setScore((prev) => prev - (prev > 0 ? (gameMode === "timeAttack" ? 0 : 1) * penalty : 0));
          setTimeout(() => {
            updateCellColor(firstSelection.row, firstSelection.col, "var(--theme-body-primary-bg)");
            updateCellColor(row, col, "var(--theme-body-primary-bg)");
            setIsWaiting(false);
          }, 1000);
        } else {
          // Khớp, thêm vào matched cells
          setScore((prev) => prev + reward);
          const newMatched = new Set(matchedCells);
          newMatched.add(`${firstSelection.row}-${firstSelection.col}`);
          newMatched.add(cellKey);
          setMatchedCells(newMatched);
          
          // Tăng bộ đếm
          setMatchedCount((prevCount) => {
            const newCount = prevCount + 1;
            // Kiểm tra nếu tất cả ô đã được ghép
            if (!gameBoardSize) {
              setIsWaiting(false);
              return newCount;
            }
            const totalPairs = (gameBoardSize.rows * gameBoardSize.cols) / 2;
            if (newCount === totalPairs) {
              setIsGameComplete(true);
              Toast({
                type: "success",
                title: "🎉 Congratulations!",
                message: "You matched all pairs!"
              });
            }
            setIsWaiting(false);
            return newCount;
          });
        }
      }
      setFirstSelection(null);
      setIsFirstSelection(true);
      setTurnCount((prevTurn) => prevTurn + 1);
    }
  };

  const resetBoard = useCallback(() => {
    setGameBoard(
      Array.from({ length: gameBoardSize?.rows ?? 0 }, () =>
        Array.from({ length: gameBoardSize?.cols ?? 0 }, () => "var(--theme-body-primary-bg)")
      )
    );
    setGameArray(generateGameArray());
    setMatchedCount(0);
    setTurnCount(0);
    setScore(0);
    setIsGameComplete(false);
    setFirstSelection(null);
    setIsFirstSelection(true);
    setIsWaiting(false);
    setMatchedCells(new Set());
    setTimeLeft(timeLimit);
    setIsGameOver(false);
    Toast({ type: "info", message: "Board reset!" });
  }, [gameBoardSize]);

  const saveGame = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/games/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken || ""}`,
        },
        body: JSON.stringify({
          game_id: "6",
          data: {
            boardSize: gameBoardSize,
            board: gameBoard,
            gameArray: gameArray,
            matchedCount: matchedCount,
            turnCount: turnCount,
            score: score,
            isGameComplete: isGameComplete,
            matchedCells: Array.from(matchedCells),
            isFirstSelection: isFirstSelection,
            firstSelection: firstSelection,
            isWaiting: isWaiting,
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
  }, [gameBoardSize, gameBoard, gameArray, matchedCount, turnCount, score, isGameComplete, matchedCells, isFirstSelection, firstSelection, isWaiting, timeLeft, gameMode, selectedModeIndex, accessToken]);

  const loadGame = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/games/load?game_id=6`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken || ""}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load game");
      }

      const gameData = await res.json();
      const data = gameData?.data?.data ?? {};

      setGameBoard(data.board || gameBoard);
      setGameArray(data.gameArray || []);
      setMatchedCount(data.matchedCount || 0);
      setTurnCount(data.turnCount || 0);
      setScore(data.score || 0);
      setIsGameComplete(data.isGameComplete || false);
      setMatchedCells(new Set(data.matchedCells || []));
      setIsFirstSelection(data.isFirstSelection ?? true);
      setFirstSelection(data.firstSelection || null);
      setIsWaiting(data.isWaiting ?? false);
      setTimeLeft(data.timeLeft ?? timeLimit);
      setGameMode(data.gameMode ?? null);
      setSelectedModeIndex(data.selectedModeIndex ?? 0);

      Toast({
        type: "success",
        title: "Success",
        message: "Game loaded successfully"
      });
    } catch (error) {
      Toast({
        type: "error",
        message: "Failed to load game"
      });
    }
  }, [accessToken, timeLimit, gameBoard]);

  return (
    <div className={styles["game-page"]} style={{ flexDirection: "column" }}>
      {gameMode && (
        <div className={styles["game-options-menu"]}>
          <button
            className={styles["reset-board-button"]}
            onClick={() => setGameState && setGameState("unloaded")}
          >
            Return
          </button>
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

      <div>
        {isGameComplete && (
          <div style={{
            textAlign: "center",
            marginTop: "10px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#4CAF50",
            marginBottom: "20px"
          }}>
            🎉 All pairs matched! 🎉
          </div>
        )}
      </div>

      <GameZone
        gameBoard={gameMode ? gameBoard : modesBoards[selectedModeIndex]}
        handleCellClick={handleOnClick}
        getCellStyle={(row, col) => {
          const cellKey = `${row}-${col}`;
          const isMatched = matchedCells.has(cellKey);
          return {
            opacity: isMatched ? 0.5 : 1,
            cursor: isMatched || isWaiting ? "not-allowed" : "pointer"
          };
        }}
        leftPanelContent={
          gameMode ? (
            <div style={{ textAlign: "center" }} className={styles["player-turn-indicator"]}>
              <h3 className={styles["game-title"]}>Memory Matching</h3>
              <p style={{ fontSize: "16px", lineHeight: "1.4" }}>
                Click on a card to reveal it.
              </p>
              <p style={{ fontSize: "14px", color: "#888" }}>
                Match all pairs to win!
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center" }} className={styles["player-turn-indicator"]}>
              <h3 className={styles["game-title"]}>Memory Matching</h3>
              <p style={{ fontSize: "14px", color: "#888" }}>
                Select your preferred game mode
              </p>
            </div>
          )
        }
        rightPanelContent={
          gameMode ? (
            <div className={styles["player-turn-indicator"]} 
              style={{ textAlign: "center" }}>            
              <h3>Score</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: "#22c55e" }}>{score}</p>
              <hr style={{ margin: "1rem 0", borderColor: "#444" }} />
              {gameMode === "timeAttack" && (
                <>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: timeLeft <= 5 ? "#FF6B6B" : "#FFC107" }}>
                    Time: {timeLeft}s
                  </p>
                  <hr style={{ margin: "1rem 0", borderColor: "#444" }} />
                </>
              )}
              <p>Tries count: {turnCount}</p>
              <p>Matched pairs: {matchedCount} / {(gameBoardSize ? (gameBoardSize.rows * gameBoardSize.cols) / 2 : 0)}</p>
            </div>
          ) : (
            <div className={styles["player-turn-indicator"]} style={{ textAlign: "center" }}>
              <h3>Select Game Mode</h3>
              <p style={{ marginBottom: "10px" }}>Use &larr; &rarr; to navigate, Enter to select</p>
              <h2 style={{ color: "#22c55e" }}>{modes[selectedModeIndex].label}</h2>
              <p style={{ fontSize: "14px", color: "#888" }}>{modes[selectedModeIndex].description}</p>
            </div>
          )
        }
      />
    </div>
  );
};

export default MemoryMatchingContent;

import { useCallback, useState } from "react";
import styles from "./MemoryMatching.module.css";
import { Toast } from "../../../stores/toastStore";

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
}: FreePlayContentProps) => {
  // Sử dụng props từ parent nếu có, nếu không dùng local state
  const [gameArray, setGameArray] = useState<string[][]>(propsGameArray);
  const [isFirstSelection, setIsFirstSelection] = useState<boolean>(propsIsFirstSelection);
  const [firstSelection, setFirstSelection] = useState<{ row: number; col: number } | null>(propsFirstSelection);
  const [matchedCount, setMatchedCount] = useState<number>(propsMatchedCount);
  const [turnCount, setTurnCount] = useState<number>(propsTurnCount);
  const [isGameComplete, setIsGameComplete] = useState<boolean>(propsIsGameComplete);
  const [isWaiting, setIsWaiting] = useState<boolean>(propsIsWaiting);
  const [matchedCells, setMatchedCells] = useState<Set<string>>(propsMatchedCells);
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
          setTimeout(() => {
            updateCellColor(firstSelection.row, firstSelection.col, "var(--theme-body-primary-bg)");
            updateCellColor(row, col, "var(--theme-body-primary-bg)");
            setIsWaiting(false);
          }, 1000);
        } else {
          // Khớp, thêm vào matched cells
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
    setIsGameComplete(false);
    setFirstSelection(null);
    setIsFirstSelection(true);
    setIsWaiting(false);
    setMatchedCells(new Set());
    Toast({ type: "info", message: "Board reset!" });
  }, [gameBoardSize]);

  const saveGame = useCallback(() => {
    const gameData = {
      // Thông tin cơ bản
      boardSize: gameBoardSize,
      
      // Trạng thái board
      board: gameBoard,
      gameArray: gameArray,
      
      // Trạng thái game
      matchedCount: matchedCount,
      turnCount: turnCount,
      isGameComplete: isGameComplete,
      matchedCells: Array.from(matchedCells),
      
      // Trạng thái lựa chọn
      isFirstSelection: isFirstSelection,
      firstSelection: firstSelection,
      isWaiting: isWaiting,
      
      // Metadata
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("memoryMatchingGameData", JSON.stringify(gameData));
    Toast({ type: "success", title: "Success", message: "Game saved successfully" });
  }, [gameBoardSize, gameBoard, gameArray, matchedCount, turnCount, isGameComplete, matchedCells, isFirstSelection, firstSelection, isWaiting]);

  const loadGame = useCallback(() => {
    const savedGameData = localStorage.getItem("memoryMatchingGameData");
    if (savedGameData) {
      try {
        const gameData = JSON.parse(savedGameData);
        
        // Restore board
        setGameBoard(gameData.board);
        
        // Restore game array
        setGameArray(gameData.gameArray || []);
        
        // Restore game state
        setMatchedCount(gameData.matchedCount || 0);
        setTurnCount(gameData.turnCount || 0);
        setIsGameComplete(gameData.isGameComplete || false);
        setMatchedCells(new Set(gameData.matchedCells || []));
        
        // Restore selection state
        setIsFirstSelection(gameData.isFirstSelection ?? true);
        setFirstSelection(gameData.firstSelection || null);
        setIsWaiting(gameData.isWaiting ?? false);
        
        Toast({
          type: "success",
          title: "Success",
          message: `Game loaded! Progress: ${gameData.turnCount} turns, ${gameData.matchedCount} matched`
        });
      } catch (error) {
        Toast({
          type: "error",
          message: "Failed to load game data"
        });
      }
    } else {
      Toast({
        type: "warning",
        message: "No saved game found"
      });
    }
  }, []);

  return (
    <div className={styles["game-page"]} style={{ flexDirection: "column" }}>
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

      <div>
        <div className={styles["matched-count"]}>
          Matched: {matchedCount}
        </div>
        <div className={styles["turn-indicator"]}>
          Turn: {turnCount}
        </div>
        {isGameComplete && (
          <div style={{
            textAlign: "center",
            marginTop: "10px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#4CAF50"
          }}>
            🎉 All pairs matched! 🎉
          </div>
        )}
      </div>

      <div className={styles["board-game-container"]}>
        {gameBoard.map((row, rowIndex) => (
          <div key={rowIndex} className={styles["board-game-row"]}>
            {row.map((cellColor, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;
              const isMatched = matchedCells.has(cellKey);
              return (
                <button
                  key={colIndex}
                  className={styles["board-game-cell"]}
                  style={{ 
                    backgroundColor: cellColor,
                    opacity: isMatched ? 0.5 : 1,
                    cursor: isMatched || isWaiting ? "not-allowed" : "pointer"
                  }}
                  onClick={() => handleOnClick(rowIndex, colIndex)}
                  disabled={isMatched || isWaiting || isGameComplete}
                ></button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryMatchingContent;

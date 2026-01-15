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
}

const MemoryMatchingContent = ({
  gameBoard,
  setGameBoard,
  gameBoardSize,
  setGameState,
}: FreePlayContentProps) => {
  const [gameArray, setGameArray] = useState<string[][]>([]);
  const [isFirstSelection, setIsFirstSelection] = useState<boolean>(true);
  const [firstSelection, setFirstSelection] = useState<{ row: number; col: number } | null>(null);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [isGameComplete, setIsGameComplete] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [matchedCells, setMatchedCells] = useState<Set<string>>(new Set());
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

  const handleOnClick = (row: number, col: number) => {
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
    setGameArray([]);
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
      boardSize: gameBoardSize,
      board: gameBoard,
    };
    localStorage.setItem("freePlayGameData", JSON.stringify(gameData));
    Toast({ type: "success", title: "Success", message: "Game saved successfully" });
  }, [gameBoardSize, gameBoard]);

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

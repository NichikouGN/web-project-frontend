import { useCallback, useState } from "react";
import styles from "./FreePlay.module.css";
import { Toast } from "../../../stores/toastStore";

interface FreePlayContentProps {
  gameBoard: string[][];
  setGameBoard: React.Dispatch<React.SetStateAction<string[][]>>;
  gameBoardSize?: { rows: number; cols: number };
  setGameState?: React.Dispatch<
    React.SetStateAction<"unloaded" | "loadError" | "fetchError" | "loaded">
  >;
}

const FreePlayContent = ({
  gameBoard,
  setGameBoard,
  gameBoardSize,
  setGameState,
}: FreePlayContentProps) => {
  const [selectedColor, setSelectedColor] = useState<string>("#000000");

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value);
  };

  const updateCellColor = (row: number, col: number, color: string) => {
    setGameBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      newBoard[row][col] = color;
      return newBoard;
    });
  };

  const resetBoard = useCallback(() => {
    setGameBoard(
      Array.from({ length: gameBoardSize?.rows ?? 0 }, () =>
        Array.from({ length: gameBoardSize?.cols ?? 0 }, () => "var(--theme-body-primary-bg)")
      )
    );
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
        <input
          className={styles["color-picker"]}
          value={selectedColor}
          onChange={handleColorChange}
          type="color"
        />
      </div>
      <div className={styles["board-game-container"]}>
        {gameBoard.map((row, rowIndex) => (
          <div key={rowIndex} className={styles["board-game-row"]}>
            {row.map((cellColor, colIndex) => (
              <button
                key={colIndex}
                className={styles["board-game-cell"]}
                style={{ backgroundColor: cellColor }}
                onClick={() => updateCellColor(rowIndex, colIndex, selectedColor)}
              ></button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreePlayContent;

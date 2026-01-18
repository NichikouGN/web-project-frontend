import { useCallback, useState } from "react";
import styles from "../0-css/games.module.css";
import { Toast } from "../../../stores/toastStore";
import GameZone from "../GameZone/GameZone";

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

  const handleCellClick = (row: number, col: number) => {
    updateCellColor(row, col, selectedColor);
  }

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

  const loadGame = useCallback(() => {
    const savedData = localStorage.getItem("freePlayGameData");
    if (savedData) {
      const gameData = JSON.parse(savedData);
      setGameBoard(gameData.board);
    }
  }, [setGameBoard]);

  const leftPanelContent = (
    <div style={{ textAlign: "center" }}>
      <h3 className={styles["game-title"]}>FREE PLAY</h3>
    </div>
  );

  const rightPanelContent = (
    <div style={{ textAlign: "center" }}>
      <p className={styles["player-turn-indicator"]}>Draw whatever you want</p>
    </div>
  );

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
        <input
          type="color"
          value={selectedColor}
          onChange={handleColorChange}
          className={styles["color-picker"]}
        />

      </div>
      <GameZone
        gameBoard={gameBoard}
        handleCellClick={handleCellClick}
        leftPanelContent={leftPanelContent}
        rightPanelContent={rightPanelContent}
      />
    </div>
  );
};

export default FreePlayContent;

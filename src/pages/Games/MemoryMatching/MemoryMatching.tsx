import { useCallback, useState } from "react";
import styles from "./MemoryMatching.module.css";
import { Toast } from "../../../stores/toastStore";
import MemoryMatchingContent from "./MemoryMatchingContent";

interface MemoryMatchingProps {
  gameBoard: string[][];
  setGameBoard: React.Dispatch<React.SetStateAction<string[][]>>;
  gameBoardSize?: { rows: number; cols: number };
  setGameState?: React.Dispatch<
    React.SetStateAction<"unloaded" | "loadError" | "fetchError" | "loaded">
  >;
}

const MemoryMatching = () => {
  const [gameBoardSize, setGameBoardSize] = useState<{ rows: number; cols: number } | null>(null);
  const [board, setBoard] = useState<string[][]>([]);
  const mockedBoardSize = { rows: 4, cols: 4 };
  const [gameState, setGameState] = useState<"unloaded" | "loadError" | "fetchError" | "loaded">(
    "unloaded"
  );

  const loadGame = useCallback(() => {
    const savedBoard = localStorage.getItem("freePlayGameData");
    if (savedBoard) {
      const gameData = JSON.parse(savedBoard);
      setGameBoardSize(gameData.boardSize);
      setBoard(gameData.board);
      setGameState("loaded");
    } else {
      Toast({ type: "error", message: "No saved game found" });
      setGameState("loadError");
    }
  }, []);

  const fetchGameBoardSize = useCallback(async () => {
    try {
      /*
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/game/free-play/board-size`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch game board size");
      }
      const data = await res.json();
      */
      //Temporary hardcoded board size until backend is ready
      const data = { boardSize: mockedBoardSize };
      setGameBoardSize(data.boardSize);
      setBoard(generateEmptyBoard(data.boardSize));
      setGameState("loaded");
    } catch (error) {
      Toast({ type: "error", title: "Error", message: "Failed to fetch game board size" });
      setGameState("fetchError");
    }
  }, [gameState]);

  const generateEmptyBoard = useCallback(
    ({ rows, cols }: { rows: number; cols: number }) => {
      const emptyBoard = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => "var(--theme-body-primary-bg)")
      );

      return emptyBoard;
    },
    [gameBoardSize]
  );

  return (
    <>
      {gameBoardSize && gameState === "loaded" ? (
        <MemoryMatchingContent
          gameBoard={board!}
          setGameBoard={setBoard}
          gameBoardSize={gameBoardSize}
          setGameState={setGameState}
        />
      ) : (
        <div className={styles["game-page"]}>
          <div className={styles["game-container"]}>
            <div className={styles["game-card"]}>
              <h2>Memory Matching</h2>
              <h4>Match pairs of cards to win the game</h4>
            </div>

            <div className={styles["game-options"]}>
              <button className={styles["game-play-prompt"]} onClick={fetchGameBoardSize}>
                <h3>Start New Game</h3>
              </button>
              <button
                className={styles["game-play-prompt"]}
                onClick={() => {
                  const gameData = {
                    boardSize: mockedBoardSize,
                    board: generateEmptyBoard(mockedBoardSize),
                  };
                  localStorage.setItem("freePlayGameData", JSON.stringify(gameData));

                  Toast({
                    type: "success",
                    title: "Success",
                    message: "Added sample data to local storage",
                  });
                }}
              >
                <h3>[DBG] Add Local Storage</h3>
              </button>

              <button className={styles["game-play-prompt"]} onClick={loadGame}>
                <h3>Load Game</h3>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MemoryMatching;

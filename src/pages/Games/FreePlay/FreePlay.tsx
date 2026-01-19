import { useCallback, useEffect, useState } from "react";
import { Toast } from "../../../stores/toastStore";
import FreePlayContent from "./FreePlayContent";
import {
  getGameBoardSize,
} from "../../../api/games.api";

const FreePlay = () => {
  const gameId = 7; // Assuming Free Play has gameId 7
  const [gameBoardSize, setGameBoardSize] = useState<{ rows: number; cols: number } | null>(null);
  const [board, setBoard] = useState<string[][]>([]);

  const [gameState, setGameState] = useState<"unloaded" | "loadError" | "fetchError" | "loaded">(
    "unloaded",
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
        const data = await getGameBoardSize(gameId);
        setGameBoardSize(data);
        setBoard(generateEmptyBoard(data));
        setGameState("loaded");
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to fetch game board size" });
        setGameState("fetchError");
      }
    }, [gameId]);

  const generateEmptyBoard = useCallback(
    ({ rows, cols }: { rows: number; cols: number }) => {
      const emptyBoard = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => "var(--theme-body-primary-bg)"),
      );

      return emptyBoard;
    },
    [gameBoardSize],
  );

  useEffect(() => {
    if (!(gameBoardSize && gameState === "loaded")) {
      fetchGameBoardSize();
    }
  }, [gameBoardSize, gameState, fetchGameBoardSize]);

  return (
    <>
      {gameBoardSize && gameState === "loaded" ? (
        <FreePlayContent
          gameBoard={board!}
          setGameBoard={setBoard}
          gameBoardSize={gameBoardSize}
          setGameState={setGameState}
        />
      ) : null}

      {/*
          (
        <div className={styles["game-page"]}>
          <div className={styles["game-container"]}>
            <div className={styles["game-card"]}>
              <h2>Free Play</h2>
              <h4>Play any game without restrictions</h4>
            </div>

            <div className={styles["game-options"]}>
              <button className={styles["game-play-prompt"]} onClick={fetchGameBoardSize}>
                <h3>Start New Game</h3>
              </button>
              <button
                className={styles["game-play-prompt"]}
                onClick={() => {
                  const gameData = {
                    boardSize: { rows: 10, cols: 10 },
                    board: generateEmptyBoard({ rows: 10, cols: 10 }),
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
        */}
    </>
  );
};

export default FreePlay;

import { useCallback, useEffect, useState } from "react";
import styles from "../0-css/games.module.css";
import {
  getGameBoardSize,
} from "../../../api/games.api";
import { Toast } from "../../../stores/toastStore";
import Caro4Content from "./Caro4Content";

const Caro4 = () => {
  const gameId = 2; // Assuming Caro 4 has gameId 2

  const [gameBoardSize, setGameBoardSize] = useState<{ rows: number; cols: number } | null>(null);
  const [board, setBoard] = useState<string[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<"X" | "O" | null>(null);
  const [gameState, setGameState] = useState<"unloaded" | "loadError" | "fetchError" | "loaded">(
    "unloaded"
  );
  const [playTime, setPlayTime] = useState(0);

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
        Array.from({ length: cols }, () => "")
      );

      return emptyBoard;
    },
    []
  );

  const loadGame = useCallback(() => {
    const savedGameData = localStorage.getItem("caro4GameData");
    if (savedGameData) {
      try {
        const gameData = JSON.parse(savedGameData);
        // Restore tất cả trạng thái game
        setBoard(gameData.board);
        setCurrentPlayer(gameData.currentPlayer || "X");
        setIsGameOver(gameData.isGameOver || false);
        setWinner(gameData.winner || null);
        setGameState("loaded");
        Toast({ 
          type: "success", 
          title: "Success", 
          message: "Game loaded successfully" 
        });
      } catch (error) {
        Toast({ 
          type: "error", 
          message: "Failed to load game data" 
        });
        setGameState("loadError");
      }
    } else {
      Toast({ type: "warning", message: "No saved game found" });
      setGameState("loadError");
    }
  }, []);

  useEffect(() => {
    if (!(gameBoardSize && gameState === "loaded")) {
      fetchGameBoardSize();
    }
  }, [gameBoardSize, gameState, fetchGameBoardSize]);

  return (
    <>
      {gameBoardSize && gameState === "loaded" ? (
        <Caro4Content
          gameBoard={board}
          setGameBoard={setBoard}
          gameBoardSize={gameBoardSize}
          setGameState={setGameState}
          currentPlayer={currentPlayer}
          setCurrentPlayer={setCurrentPlayer}
          isGameOver={isGameOver}
          setIsGameOver={setIsGameOver}
          winner={winner}
          setWinner={setWinner}
        />
      ) : null}

      {/* 
      : (
        <div className={styles["game-page"]}>
          <div className={styles["game-container"]}>
            <div className={styles["game-card"]}>
              <h2>Caro 4</h2>
              <h4>Match 4 in a row</h4>
            </div>

            <div className={styles["game-options"]}>
              <button
                className={styles["game-play-prompt"]}
                onClick={fetchGameBoardSize}
              >
                <h3>Start New Game</h3>
              </button>
              <button
                className={styles["game-play-prompt"]}
                onClick={() => {loadGame()}}
              >
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

export default Caro4;

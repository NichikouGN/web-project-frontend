import { useCallback, useState } from "react";
import styles from "./TicTacToe.module.css";
import { Toast } from "../../../stores/toastStore";
import TicTacToeContent from "./TicTacToeContent";

const TicTacToe = () => {
  const gameBoardSize = { rows: 3, cols: 3 };
  const [board, setBoard] = useState<string[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<"X" | "O" | null>(null);
  const [gameState, setGameState] = useState<"unloaded" | "loadError" | "fetchError" | "loaded">(
    "unloaded"
  );

  const generateEmptyBoard = useCallback(
    ({ rows, cols }: { rows: number; cols: number }) => {
      const emptyBoard = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => "")
      );

      return emptyBoard;
    },
    [gameBoardSize]
  );

  const loadGame = useCallback(() => {
    const savedGameData = localStorage.getItem("ticTacToeGameData");
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

  return (
    <>
      {gameBoardSize && gameState === "loaded" ? (
        <TicTacToeContent
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
      ) : (
        <div className={styles["game-page"]}>
          <div className={styles["game-container"]}>
            <div className={styles["game-card"]}>
              <h2>Tic Tac Toe</h2>
              <h4>Classic 3x3 grid game</h4>
            </div>

            <div className={styles["game-options"]}>
              <button
                className={styles["game-play-prompt"]}
                onClick={() => {
                  setBoard(generateEmptyBoard(gameBoardSize));
                  setGameState("loaded");
                }}
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
    </>
  );


};

export default TicTacToe;

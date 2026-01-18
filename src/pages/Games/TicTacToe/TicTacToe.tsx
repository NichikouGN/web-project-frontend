import { useCallback, useEffect, useState } from "react";
import styles from "../0-css/games.module.css";
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

  useEffect(() => {
    if (!(gameBoardSize && gameState === "loaded")) {
      setBoard(generateEmptyBoard(gameBoardSize));
      setGameState("loaded");
    }
  }, [gameBoardSize, gameState]);

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
      ) : null}
    </>
  );

};

export default TicTacToe;

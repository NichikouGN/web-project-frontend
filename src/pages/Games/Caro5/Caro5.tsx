import { useCallback, useEffect, useState } from "react";
import styles from "../0-css/games.module.css";
import {
  getGameBoardSize,
} from "../../../api/games.api";
import { Toast } from "../../../stores/toastStore";
import Caro5Content from "./Caro5Content";

const Caro5 = () => {
  const gameId = 1; // Assuming Caro 5 has gameId 1
  const [gameBoardSize, setGameBoardSize] = useState<{ rows: number; cols: number } | null>(null);
  const [board, setBoard] = useState<string[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<"X" | "O" | null>(null);
  const [gameState, setGameState] = useState<"unloaded" | "loadError" | "fetchError" | "loaded">(
    "unloaded",
  );

  const mockedBoardSize = { rows: 10, cols: 10 };

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
      const emptyBoard = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));

      return emptyBoard;
    },
    []
  );

  const loadGame = useCallback(() => {
    const savedGameData = localStorage.getItem("caro5GameData");
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
          message: "Game loaded successfully",
        });
      } catch (error) {
        Toast({
          type: "error",
          message: "Failed to load game data",
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
        <Caro5Content
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

export default Caro5;

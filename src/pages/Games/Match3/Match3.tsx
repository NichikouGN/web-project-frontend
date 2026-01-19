import { useCallback, useEffect, useState } from "react";
import styles from "../0-css/games.module.css";
import { Toast } from "../../../stores/toastStore";
import Match3Content from "./Match3Content.tsx";

const Match3 = () => {
  const [gameBoardSize, setGameBoardSize] = useState<{ rows: number; cols: number } | null>(null);
  const [board, setBoard] = useState<string[][]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameState, setGameState] = useState<"unloaded" | "loadError" | "fetchError" | "loaded">(
    "unloaded",
  );

  const mockedBoardSize = { rows: 10, cols: 10 };

  const fetchGameBoardSize = useCallback(async () => {
    try {
      /*
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/free-play/board-size`, {
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
      const emptyBoard = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));

      return emptyBoard;
    },
    [gameBoardSize],
  );

  const loadGame = useCallback(() => {
    const savedGameData = localStorage.getItem("match3GameData");
    if (savedGameData) {
      try {
        const gameData = JSON.parse(savedGameData);
        // Restore tất cả trạng thái game
        setBoard(gameData.board);
        setIsGameOver(gameData.isGameOver || false);
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
        <Match3Content
          gameBoard={board}
          setGameBoard={setBoard}
          gameBoardSize={gameBoardSize}
          setGameState={setGameState}
          isGameOver={isGameOver}
          setIsGameOver={setIsGameOver}
        />
      ) : null}
    </>
  );
};

export default Match3;

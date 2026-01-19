import { useCallback, useEffect, useState } from "react";
import styles from "../0-css/games.module.css";
import { Toast } from "../../../stores/toastStore";
import SnakeContent from "./SnakeContent";
import {
  getGameBoardSize,
  getTimer,
} from "../../../api/games.api";

const Snake = () => {
  const gameId = 4; // Assuming Snake has gameId 4
  const [gameBoardSize, setGameBoardSize] = useState<{ rows: number; cols: number } | null>(null);
  const [board, setBoard] = useState<string[][]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameState, setGameState] = useState<"unloaded" | "loadError" | "fetchError" | "loaded">(
    "unloaded",
  );
  const [timer, setTimer] = useState(0);

  const fetchGameBoardSize = useCallback(async () => {
    try {
      const data = await getGameBoardSize(gameId);
      const timerValue = await getTimer(gameId);
      setGameBoardSize(data);
      setBoard(generateEmptyBoard(data));
      setTimer(timerValue);
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
    [gameBoardSize],
  );

  const loadGame = useCallback(() => {
    const savedGameData = localStorage.getItem("snakeGameData");
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
    if (!(gameBoardSize && timer && gameState === "loaded")) {
      fetchGameBoardSize();
    }
  }, [gameBoardSize, timer, gameState, fetchGameBoardSize]);

  return (
    <>
      {gameBoardSize && gameState === "loaded" ? (
        <SnakeContent
          gameBoard={board}
          setGameBoard={setBoard}
          gameBoardSize={gameBoardSize}
          setGameState={setGameState}
          isGameOver={isGameOver}
          setIsGameOver={setIsGameOver}
          timer={timer}
        />
      ) : null}
    </>
  );
};

export default Snake;

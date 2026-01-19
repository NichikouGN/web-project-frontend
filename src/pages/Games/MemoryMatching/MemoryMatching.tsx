import { useCallback, useEffect, useState } from "react";
import styles from "../0-css/games.module.css";
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
  const [gameArray, setGameArray] = useState<string[][]>([]);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [isGameComplete, setIsGameComplete] = useState<boolean>(false);
  const [matchedCells, setMatchedCells] = useState<Set<string>>(new Set());
  const [isFirstSelection, setIsFirstSelection] = useState<boolean>(true);
  const [firstSelection, setFirstSelection] = useState<{ row: number; col: number } | null>(null);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [gameState, setGameState] = useState<"unloaded" | "loadError" | "fetchError" | "loaded">(
    "unloaded",
  );

  const mockedBoardSize = { rows: 6, cols: 6 };

  const loadGame = useCallback(() => {
    const savedGameData = localStorage.getItem("memoryMatchingGameData");
    if (savedGameData) {
      try {
        const gameData = JSON.parse(savedGameData);

        // Restore board config
        setGameBoardSize(gameData.boardSize);

        // Restore board display
        setBoard(gameData.board);

        // Restore game array
        setGameArray(gameData.gameArray || []);

        // Restore game progress
        setMatchedCount(gameData.matchedCount || 0);
        setTurnCount(gameData.turnCount || 0);
        setIsGameComplete(gameData.isGameComplete || false);
        setMatchedCells(new Set(gameData.matchedCells || []));

        // Restore selection state
        setIsFirstSelection(gameData.isFirstSelection ?? true);
        setFirstSelection(gameData.firstSelection || null);
        setIsWaiting(gameData.isWaiting ?? false);

        // Change state to loaded
        setGameState("loaded");

        Toast({
          type: "success",
          title: "Game Loaded",
          message: `Restored game: ${gameData.turnCount} turns, ${gameData.matchedCount} matched pairs`,
        });
      } catch (error) {
        Toast({ type: "error", message: "Failed to load game data" });
        setGameState("loadError");
      }
    } else {
      Toast({ type: "warning", message: "No saved game found" });
      setGameState("loadError");
    }
  }, []);

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
        <MemoryMatchingContent
          gameBoard={board!}
          setGameBoard={setBoard}
          gameBoardSize={gameBoardSize}
          setGameState={setGameState}
          gameArray={gameArray}
          setGameArray={setGameArray}
          matchedCount={matchedCount}
          setMatchedCount={setMatchedCount}
          turnCount={turnCount}
          setTurnCount={setTurnCount}
          isGameComplete={isGameComplete}
          setIsGameComplete={setIsGameComplete}
          matchedCells={matchedCells}
          setMatchedCells={setMatchedCells}
          isFirstSelection={isFirstSelection}
          setIsFirstSelection={setIsFirstSelection}
          firstSelection={firstSelection}
          setFirstSelection={setFirstSelection}
          isWaiting={isWaiting}
          setIsWaiting={setIsWaiting}
        />
      ) : null}
    </>
  );
};

export default MemoryMatching;

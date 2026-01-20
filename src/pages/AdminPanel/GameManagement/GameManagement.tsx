import { useCallback, useEffect, useState } from "react";
import styles from "./GameManagement.module.css";
import { type GameInfo } from "../../../types/AdminPanel/gameManagement.types";
import { useAuthStore } from "../../../stores/authStore";
import {
  activateGameMode,
  deactivateGameMode,
  fetchAvailableGames,
  updateBoardSize,
  updateTimer,
} from "../../../api/AdminPanel/gameMangement.api";
import { Toast } from "../../../stores/toastStore";

const GameManagement = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [availableGames, setAvailableGames] = useState<GameInfo[]>([]);
  // const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [showBoardSizeSettings, setShowBoardSizeSettings] = useState<Boolean>(false);
  const [boardWidth, setBoardWidth] = useState<number>(0);
  const [boardHeight, setBoardHeight] = useState<number>(0);
  const [showTimerSettings, setShowTimerSettings] = useState<Boolean>(false);
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    const fetchGames = async () => {
      setAvailableGames(await fetchAvailableGames(accessToken));
    };

    fetchGames();
  }, [accessToken]);

  const handleGameModeActivation = useCallback(
    async (gameId: number) => {
      try {
        await activateGameMode(accessToken, gameId);
        setAvailableGames((prevGames) =>
          prevGames.map((game) => (game.gameId === gameId ? { ...game, isActive: true } : game)),
        );

        Toast({ type: "success", title: "Success", message: "Game mode activated successfully" });
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to activate game mode" });
        console.error("Error activating game mode:", error);
      }
    },
    [accessToken],
  );

  const handleGameModeDeactivation = useCallback(
    async (gameId: number) => {
      try {
        await deactivateGameMode(accessToken, gameId);
        setAvailableGames((prevGames) =>
          prevGames.map((game) => (game.gameId === gameId ? { ...game, isActive: false } : game)),
        );
        Toast({ type: "success", title: "Success", message: "Game mode deactivated successfully" });
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to deactivate game mode" });
        console.error("Error deactivating game mode:", error);
      }
    },
    [accessToken],
  );

  const exitBoardSizeSettings = () => {
    setShowBoardSizeSettings(false);
    setBoardWidth(0);
    setBoardHeight(0);
  };

  const handleBoardWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoardWidth(isNaN(Number(e.target.value)) ? 0 : Number(e.target.value));
  };

  const handleBoardHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoardHeight(isNaN(Number(e.target.value)) ? 0 : Number(e.target.value));
  };

  const handleBoardSizeFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateBoardSize(accessToken, selectedGameId!, {
        width: boardWidth,
        height: boardHeight,
      });
      setAvailableGames((prevGames) =>
        prevGames.map((game) =>
          game.gameId === selectedGameId
            ? { ...game, boardWidth: boardWidth, boardHeight: boardHeight }
            : game,
        ),
      );
      Toast({ type: "success", title: "Success", message: "Board size updated successfully" });
    } catch (error) {
      Toast({ type: "error", title: "Error", message: "Failed to update board size" });
      console.error("Error updating board size:", error);
    }

    setShowBoardSizeSettings(false);
    setBoardWidth(0);
    setBoardHeight(0);
  };

  const exitTimerSettings = () => {
    setShowTimerSettings(false);
    setTimer(0);
  };

  const handleTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimer(isNaN(Number(e.target.value)) ? 0 : Number(e.target.value));
  };

  const handleTimerFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateTimer(accessToken, selectedGameId!, timer);
      setAvailableGames((prevGames) =>
        prevGames.map((game) =>
          game.gameId === selectedGameId ? { ...game, timer: timer } : game,
        ),
      );

      Toast({ type: "success", title: "Success", message: "Timer updated successfully" });
    } catch (error) {
      Toast({ type: "error", title: "Error", message: "Failed to update timer" });
      console.error("Error updating timer:", error);
    }
    setShowTimerSettings(false);
  };

  return (
    <>
      {showBoardSizeSettings && (
        <div className={styles["popup-container"]}>
          <div className={styles["popup-panel"]}>
            <h2 className={styles["popup-title"]}>Edit Board Size</h2>
            <form className={styles["board-size-form"]} onSubmit={handleBoardSizeFormSubmit}>
              <div className={styles["board-size-input-container"]}>
                <input
                  className={styles["board-size-input"]}
                  value={boardWidth}
                  onChange={handleBoardWidthChange}
                />
                {" x "}
                <input
                  className={styles["board-size-input"]}
                  value={boardHeight}
                  onChange={handleBoardHeightChange}
                />
              </div>

              <div className={styles["board-size-buttons"]}>
                <button
                  className={styles["popup-button"]}
                  style={{ backgroundColor: "var(--theme-body-tertiary-bg)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    exitBoardSizeSettings();
                  }}
                >
                  Close
                </button>
                <button type="submit" className={styles["popup-button"]}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTimerSettings && (
        <div className={styles["popup-container"]}>
          <div className={styles["popup-panel"]}>
            <h2 className={styles["popup-title"]}>Edit Timer</h2>
            <form className={styles["board-size-form"]} onSubmit={handleTimerFormSubmit}>
              <input
                className={styles["board-size-input"]}
                value={timer}
                onChange={handleTimerChange}
              />
              <div className={styles["board-size-buttons"]}>
                <button
                  className={styles["popup-button"]}
                  style={{ backgroundColor: "var(--theme-body-tertiary-bg)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    exitTimerSettings();
                  }}
                >
                  Close
                </button>
                <button type="submit" className={styles["popup-button"]}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles["game-management"]}>
        <div className={styles["game-card-container"]}>
          {availableGames.map((game) => (
            <div key={game.gameId} className={styles["game-card"]}>
              <h3 className={styles["game-title"]}>{game.title}</h3>
              <div className={styles["game-details"]}>
                <button
                  className={`${styles["game-status"]} ${game.isActive ? styles["active"] : styles["inactive"]}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    game.isActive
                      ? handleGameModeDeactivation(game.gameId)
                      : handleGameModeActivation(game.gameId);
                  }}
                >
                  {game.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  className={styles["game-board-size"]}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGameId(game.gameId);
                    setShowBoardSizeSettings(true);
                  }}
                >
                  {game.boardWidth} x {game.boardHeight}
                </button>
                <button
                  className={styles["game-timer"]}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGameId(game.gameId);
                    setShowTimerSettings(true);
                  }}
                >
                  {game.timer} s
                </button>
              </div>
              <p className={styles["game-description"]}>{game.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default GameManagement;

import { useCallback, useEffect, useState } from "react";
import styles from "./GameManagement.module.css";
import { type GameInfo } from "../../../types/AdminPanel/gameManagement.types";
import { useAuthStore } from "../../../stores/authStore";
import {
  activateGameMode,
  deactivateGameMode,
  fetchAvailableGames,
  fetchGameDetails,
  updateBoardSize,
} from "../../../api/AdminPanel/gameMangement.api";
import { Toast } from "../../../stores/toastStore";
import { IoCloseSharp } from "react-icons/io5";

const sampleGames: Omit<GameInfo, "status" | "boardSize">[] = [
  {
    gameId: "1",
    title: "Caro 5",
    description: "Match 5 in a row",
  },
  {
    gameId: "2",
    title: "Caro 4",
    description: "Match 4 in a row",
  },
  {
    gameId: "3",
    title: "Tic Tac Toe",
    description: "Classic 3x3 grid game",
  },
  {
    gameId: "4",
    title: "Snake",
    description: "Control the snake to eat food",
  },
  {
    gameId: "5",
    title: "Match 3",
    description: "Match 3 or more items to score points",
  },
  {
    gameId: "6",
    title: "Memory Matching",
    description: "Find pairs of matching cards",
  },
  {
    gameId: "7",
    title: "Free Play",
    description: "Play any game without restrictions",
  },
];

const GameManagement = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [availableGames, setAvailableGames] = useState<Omit<GameInfo, "status" | "boardSize">[]>(
    []
  );
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [showBoardSizeSettings, setShowBoardSizeSettings] = useState<Boolean>(false);
  const [boardSize, setBoardSize] = useState<number>(0);

  useEffect(() => {
    const fetchGames = async () => {
      setAvailableGames(await fetchAvailableGames(accessToken));
    };

    fetchGames();
    // setAvailableGames(sampleGames);
  }, []);

  const handleGameClick = useCallback(
    async (gameId: string) => {
      try {
        setGameInfo(await fetchGameDetails(accessToken, gameId));
        // setGameInfo({
        //   gameId: "1",
        //   title: "Caro 5",
        //   description: "Match 5 in a row",
        //   status: "active",
        //   boardSize: 15,
        // });
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to fetch game details" });
        console.error("Error fetching game details:", error);
      }
    },
    [accessToken]
  );

  const handleGameModeActivation = useCallback(
    async (gameId: string) => {
      try {
        await activateGameMode(accessToken, gameId);
        Toast({ type: "success", title: "Success", message: "Game mode activated successfully" });
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to activate game mode" });
        console.error("Error activating game mode:", error);
      }
    },
    [accessToken]
  );

  const handleGameModeDeactivation = useCallback(
    async (gameId: string) => {
      try {
        await deactivateGameMode(accessToken, gameId);
        Toast({ type: "success", title: "Success", message: "Game mode deactivated successfully" });
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to deactivate game mode" });
        console.error("Error deactivating game mode:", error);
      }
    },
    [accessToken]
  );

  const exitBoardSizeSettings = () => {
    setShowBoardSizeSettings(false);
    setBoardSize(0);
  };

  const handleBoardSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoardSize(isNaN(Number(e.target.value)) ? 0 : Number(e.target.value));
  };

  const handleBoardSizeFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateBoardSize(accessToken, gameInfo!.gameId, boardSize);
      Toast({ type: "success", title: "Success", message: "Board size updated successfully" });
    } catch (error) {
      Toast({ type: "error", title: "Error", message: "Failed to update board size" });
      console.error("Error updating board size:", error);
    }

    setShowBoardSizeSettings(false);
  };

  return (
    <>
      {gameInfo && (
        <div className={styles["popup-container"]}>
          <div className={styles["popup-panel"]}>
            <button className={styles["close-popup"]} onClick={() => setGameInfo(null)}>
              <IoCloseSharp />
            </button>
            <h2 className={styles["popup-title"]}>{gameInfo.title}</h2>
            <p className={styles["popup-description"]}>{gameInfo.description}</p>
            <div className={styles["popup-details"]}>
              <div className={styles["popup-detail"]}>
                <div className={styles["popup-detail__label"]}>
                  Status:{" "}
                  <span
                    style={{
                      textTransform: "capitalize",
                      fontWeight: "bold",
                      color: `${
                        gameInfo.status === "active" ? "var(--green-400)" : "var(--red-400)"
                      }`,
                    }}
                  >
                    {gameInfo.status}
                  </span>
                </div>

                {gameInfo.status === "active" ? (
                  <button
                    className={styles["popup-button"]}
                    onClick={() => handleGameModeDeactivation(gameInfo.gameId)}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    className={styles["popup-button"]}
                    onClick={() => handleGameModeActivation(gameInfo.gameId)}
                  >
                    Activate
                  </button>
                )}
              </div>
              <div className={styles["popup-detail"]}>
                <div className={styles["popup-detail__label"]}>
                  Board Size:{" "}
                  <span
                    style={{
                      textTransform: "capitalize",
                      fontWeight: "bold",
                      color: "var(--theme-text-primary)",
                    }}
                  >
                    {gameInfo.boardSize} x {gameInfo.boardSize}
                  </span>
                </div>

                <button
                  className={styles["popup-button"]}
                  onClick={() => setShowBoardSizeSettings(true)}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBoardSizeSettings && (
        <div className={styles["popup-container"]}>
          <div className={styles["popup-panel"]}>
            <h2 className={styles["popup-title"]}>Edit Board Size</h2>
            <form className={styles["board-size-form"]} onSubmit={handleBoardSizeFormSubmit}>
              <input
                className={styles["board-size-input"]}
                value={boardSize}
                onChange={handleBoardSizeChange}
              />
              <div className={styles["board-size-buttons"]}>
                <button className={styles["popup-button"]} onClick={exitBoardSizeSettings}>
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
          {sampleGames.map((game) => (
            <button
              key={game.gameId}
              className={styles["game-card"]}
              onClick={() => {
                handleGameClick(game.gameId);
              }}
            >
              <h3 className={styles["game-title"]}>{game.title}</h3>
              <p className={styles["game-description"]}>{game.description}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default GameManagement;

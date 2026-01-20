import { formatConsoleError } from "../../consoleError";
import type { GameInfo } from "../../types/AdminPanel/gameManagement.types";
import { fetchWithAuth } from "../fetchWithAuth";

export const fetchAvailableGames = async (accessToken: string) => {
  try {
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/admin/game-management/available-games`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (!res.ok) {
      throw new Error("Failed to fetch available games");
    }
    const data = await res.json();
    console.log("Fetched available games:", data);
    return data.games as GameInfo[];
  } catch (error) {
    formatConsoleError("gameManagement.api.ts", "fetchAvailableGames", error);
    throw error;
  }
};

export const activateGameMode = async (accessToken: string, gameId: number) => {
  try {
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/admin/game-management/activate-game-mode/${gameId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (!res.ok) {
      throw new Error("Failed to activate game mode");
    }
  } catch (error) {
    formatConsoleError("gameManagement.api.ts", "activateGameMode", error);
    throw error;
  }
};

export const deactivateGameMode = async (accessToken: string, gameId: number) => {
  try {
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/admin/game-management/deactivate-game-mode/${gameId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (!res.ok) {
      throw new Error("Failed to deactivate game mode");
    }
  } catch (error) {
    formatConsoleError("gameManagement.api.ts", "deactivateGameMode", error);
    throw error;
  }
};

export const updateBoardSize = async (
  accessToken: string,
  gameId: number,
  boardSize: { width: number; height: number },
) => {
  try {
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/admin/game-management/update-board-size/${gameId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ boardSize }),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to update board size");
    }
  } catch (error) {
    formatConsoleError("gameManagement.api.ts", "updateBoardSize", error);
    throw error;
  }
};

export const updateTimer = async (accessToken: string, gameId: number, timer: number) => {
  try {
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/admin/game-management/update-timer/${gameId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ timer }),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to update timer");
    }
  } catch (error) {
    formatConsoleError("gameManagement.api.ts", "updateTimer", error);
    throw error;
  }
};

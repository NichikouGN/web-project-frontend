import { formatConsoleError } from "../../consoleError";
import type { GameInfo } from "../../types/AdminPanel/gameManagement.types";

export const fetchAvailableGames = async (accessToken: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/admin/game-management/available-games`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch available games");
    }
    const data = await res.json();
    return data as Omit<GameInfo, "status" | "boardSize">[];
  } catch (error) {
    formatConsoleError("gameManagement.api.ts", "fetchAvailableGames", error);
    throw error;
  }
};

export const fetchGameDetails = async (accessToken: string, gameId: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/admin/game-management/game-details/${gameId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch game details");
    }
    const data = await res.json();
    return data as GameInfo;
  } catch (error) {
    formatConsoleError("gameManagement.api.ts", "fetchGameDetails", error);
    throw error;
  }
};

export const activateGameMode = async (accessToken: string, gameId: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/admin/game-management/activate-game-mode/${gameId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error("Failed to activate game mode");
    }
  } catch (error) {
    formatConsoleError("gameManagement.api.ts", "activateGameMode", error);
    throw error;
  }
};

export const deactivateGameMode = async (accessToken: string, gameId: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/admin/game-management/deactivate-game-mode/${gameId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error("Failed to deactivate game mode");
    }
  } catch (error) {
    formatConsoleError("gameManagement.api.ts", "deactivateGameMode", error);
    throw error;
  }
};

export const updateBoardSize = async (accessToken: string, gameId: string, boardSize: number) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/admin/game-management/update-board-size/${gameId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ boardSize }),
      }
    );
    if (!res.ok) {
      throw new Error("Failed to update board size");
    }
  } catch (error) {
    formatConsoleError("gameManagement.api.ts", "updateBoardSize", error);
    throw error;
  }
};

import { Toast } from "../stores/toastStore";
import { useAuthStore } from "../stores/authStore";

export const getGameBoardSize = async (gameId: number) => {
  try {
    const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/games/${gameId}/board-size`,
        {
            method: "GET",
        }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch game board size");
    }
    const str = await res.json();
    const data = str.data;
    const boardSize = { cols: data.board_width, rows: data.board_height };
    return boardSize;
  } catch (error) {
    Toast({ type: "error", title: "Error", message: "Failed to fetch game board size" });
    throw error;
  }
};

export const getTimer = async (gameId: number) => {
  try {
    const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/games/${gameId}/timer`,
        {
            method: "GET",
        }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch game timer");
    }
    const str = await res.json();
    const data = str.data;
    return data.timer;
  } catch (error) {
    Toast({ type: "error", title: "Error", message: "Failed to fetch game timer" });
    throw error;
  }
};
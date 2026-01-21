import { Toast } from "../stores/toastStore";
import { fetchWithAuth } from "./fetchWithAuth";

export const getGameBoardSize = async (gameId: number) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/games/${gameId}/board-size`, {
      method: "GET",
    });
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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/games/${gameId}/timer`, {
      method: "GET",
    });
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

export const postGameResult = async (
  gameId: number,
  score: number,
  play_time: number,
  accessToken: string,
) => {
  try {
    const record = {
      game_id: gameId,
      score: score,
      play_time: play_time,
    };
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/games/${gameId}/play-record`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to post game result");
    }
  } catch (error) {
    Toast({ type: "error", title: "Error", message: "Failed to post game result" });
    throw error;
  }
};

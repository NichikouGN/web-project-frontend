import { formatConsoleError } from "../../consoleError";

export const fetch24HourPlayers = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/statistics/24hour-players`
    );
    if (!response.ok) {
      throw new Error(`Error fetching 24-hour players: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    formatConsoleError("statistics.api.ts", "fetch24HourPlayers", error);
    throw error;
  }
};

export const fetch24HourGamesPlayed = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/statistics/24hour-games`
    );
    if (!response.ok) {
      throw new Error(`Error fetching 24-hour games: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    formatConsoleError("statistics.api.ts", "fetch24HourGamesPlayed", error);
    throw error;
  }
};

export const fetch24HourServerLoad = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/statistics/24hour-server-load`
    );
    if (!response.ok) {
      throw new Error(`Error fetching 24-hour server load: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    formatConsoleError("statistics.api.ts", "fetch24HourServerLoad", error);
    throw error;
  }
};

export const fetchMonthlyGameTypePercentage = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/statistics/monthly-game-type-percentage`
    );
    if (!response.ok) {
      throw new Error(`Error fetching game type percentage: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    formatConsoleError("statistics.api.ts", "fetchMonthlyGameTypePercentage", error);
    throw error;
  }
};

export const fetchYearlyPlayers = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/statistics/yearly-players`
    );
    if (!response.ok) {
      throw new Error(`Error fetching yearly players: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    formatConsoleError("statistics.api.ts", "fetchYearlyPlayers", error);
    throw error;
  }
};

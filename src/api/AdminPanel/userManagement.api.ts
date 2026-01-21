import { formatConsoleError } from "../../consoleError";
import type { UserManagementType } from "../../types/AdminPanel/userManagement.types";
import { fetchWithAuth } from "../fetchWithAuth";

interface FetchUsersResponse {
  users: UserManagementType[];
  totalPages: number;
}

export const fetchUsersForManagement = async (
  accessToken: string,
  curPage: number,
  setTotalPages: React.Dispatch<React.SetStateAction<number>>,
) => {
  try {
    console.log("Fetching users for page:", curPage);
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/admin/user-management?page=${curPage}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await res.json();
    setTotalPages(data.totalPages);
    return data;
  } catch (error) {
    formatConsoleError("userManagement.api.ts", "fetchUsers", error);
    throw error;
  }
};

export const fetchUsersFromSearch = async (searchInput: string, accessToken: string) => {
  try {
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/admin/user-management/search?query=${searchInput}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!res.ok) {
      throw new Error("Failed to fetch user from search");
    }
    const data: FetchUsersResponse = await res.json();
    return data;
  } catch (error) {
    formatConsoleError("userManagement.api.ts", "fetchUserFromSearch", error);
    throw error;
  }
};

export const activateUserAccount = async (userId: string, accessToken: string) => {
  try {
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/admin/user-management/activate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to activate user account");
    }

    return true;
  } catch (error) {
    formatConsoleError("userManagement.api.ts", "activateUserAccount", error);
    throw error;
  }
};
export const deactivateUserAccount = async (userId: string, accessToken: string) => {
  try {
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/admin/user-management/deactivate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to deactivate user account");
    }
    return true;
  } catch (error) {
    formatConsoleError("userManagement.api.ts", "deactivateUserAccount", error);
    throw error;
  }
};

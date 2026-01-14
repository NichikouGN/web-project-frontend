import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import { formatConsoleError } from "../consoleError";
import type { userInformation } from "../types/userType";

interface UserContextType {
  userInformation: userInformation;
  fetchUserInfo: () => Promise<void>;
}

export const useUserStore = create<UserContextType>()(
  subscribeWithSelector((set) => ({
    userInformation: {
      userId: "",
      username: "",
      email: "",
      bio: "",
    },

    fetchUserInfo: async () => {
      const { signInState, accessToken, requestNewAccessToken } = useAuthStore.getState();

      try {
        if (signInState === "authorized" && accessToken) {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-info`, {
            method: "GET",
            headers: {
              authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          });

          //If access token is invalid or expired request a new one
          if (res.status === 401) {
            await requestNewAccessToken();
            return;
          }

          const data = await res.json();

          //Set user information state
          set({
            userInformation: {
              userId: data.userId,
              username: data.username,
              email: data.email,
              bio: data.bio,
            },
          });
        }
      } catch (e) {
        formatConsoleError("userStore.ts", "fetchUserInfo", e);
      }
    },
  }))
);

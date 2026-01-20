import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import { formatConsoleError } from "../consoleError";
import type { userInformation } from "../types/userType";

interface UserContextType {
  userInformation: userInformation;
  fetchUserInfo: () => Promise<void>;
  wipeUserInfo?: () => void;
}

export const useUserStore = create<UserContextType>()(
  subscribeWithSelector((set) => ({
    userInformation: {
      userId: "",
      username: "",
      fullName: "",
      email: "",
      bio: "",
      avatarUrl: "",
      role: "user",
    },

    wipeUserInfo: () => {
      set({
        userInformation: {
          userId: "",
          username: "",
          fullName: "",
          email: "",
          bio: "",
          avatarUrl: "",
          role: "user",
        },
      });
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
          console.log("Fetched user info:", data);

          //Set user information state
          set({
            userInformation: {
              userId: data.userId,
              username: data.username,
              fullName: data.fullName,
              email: data.email,
              bio: data.bio,
              avatarUrl: data.avatarUrl,
              role: data.role,
            },
          });
        }
      } catch (e) {
        formatConsoleError("userStore.ts", "fetchUserInfo", e);
      }
    },
  })),
);

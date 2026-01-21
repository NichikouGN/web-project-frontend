import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatConsoleError } from "../consoleError";
import { Toast } from "./toastStore";
import { AuthError } from "../errors/AuthError";

interface authStoreType {
  accessToken: string;
  setAccessToken: (accessToken: string) => void;

  refreshToken: string;
  setRefreshToken: (refreshToken: string) => void;

  setUpToken: (accessToken: string, refreshToken: string) => void;
  clearToken: () => void;
  throwAuthError: (status: number) => Error;

  validateAccessToken: () => Promise<boolean>;
  requestNewAccessToken: () => Promise<boolean>;

  signInState: "unauthorized" | "admin" | "authorized";
  setSignInState: (state: "unauthorized" | "admin" | "authorized") => void;

  signIn: (email: string, password: string) => Promise<void>;
  adminSignIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<boolean>;

  signOut: () => void;
}

export const useAuthStore = create<authStoreType>()(
  persist(
    (set, get) => ({
      accessToken: "",
      refreshToken: "",
      twoFactorToken: "",
      signInState: "unauthorized",

      setAccessToken: (accessToken: string) => set({ accessToken }),
      setRefreshToken: (refreshToken: string) => set({ refreshToken }),
      setSignInState: (state: "unauthorized" | "admin" | "authorized") =>
        set({ signInState: state }),

      setUpToken: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      clearToken: () => {
        set({
          accessToken: "",
          refreshToken: "",
          signInState: "unauthorized",
        });
      },

      throwAuthError: (status: number) => {
        const error: any = new AuthError(status, "Authentication Error");
        return error;
      },

      validateAccessToken: async () => {
        const accessToken = get().accessToken;
        try {
          if (!get().accessToken) throw new Error("No access token found");

          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/validate/access-token`,
            {
              method: "GET",
              headers: {
                authorization: `Bearer ${accessToken}`,
                "ngrok-skip-browser-warning": "true",
              },
            },
          );

          if (!res.ok) throw get().throwAuthError(res.status);
          get().setSignInState("authorized");

          return true;
        } catch (e: any) {
          if (e.status === 401) {
            return get().requestNewAccessToken();
          } else {
            get().clearToken();
            formatConsoleError("authStore.ts", "validateAccessToken", e);
            return false;
          }
        }
      },

      requestNewAccessToken: async () => {
        const refreshToken = get().refreshToken;
        try {
          if (!refreshToken) throw new Error("No refresh token found");

          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/validate/refresh-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${refreshToken}`,
                "ngrok-skip-browser-warning": "true",
              },
            },
          );

          if (!res.ok) throw get().throwAuthError(res.status);

          const data = await res.json();
          console.log("New access token received:", data);
          get().setUpToken(data.accessToken, data.refreshToken);
          get().setSignInState(data.isAdmin ? "admin" : "authorized");

          Toast({
            title: "Session Renewed",
            message: "Your session has been renewed successfully.",
            type: "success",
          });

          return true;
        } catch (e) {
          get().clearToken();
          formatConsoleError("authStore.ts", "requestNewAccessToken", e);
          return false;
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ email: email, password: password }),
          });

          if (!res.ok) throw get().throwAuthError(res.status);

          const data = await res.json();

          // Gọi API increment login count
          // Gabage code but it works bro :))
          fetch(`${import.meta.env.VITE_API_URL}/api/user-stats/increment-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.accessToken}`,
            },
          }).catch((error) => {
            console.error("Failed to increment login count:", error);
          });

          get().setUpToken(data.accessToken, data.refreshToken);
          get().setSignInState("authorized");
        } catch (error: any) {
          if (error.status === 401) {
            alert("Your username or password is incorrect");
          } else {
            alert("500 Internal Server Error");
          }
        }
      },

      adminSignIn: async (email: string, password: string) => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admin/signin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ email: email, password: password }),
          });

          if (!res.ok) throw get().throwAuthError(res.status);

          const data = await res.json();

          get().setUpToken(data.accessToken, data.refreshToken);
          get().setSignInState("admin");
        } catch (error: any) {
          if (error.status === 401) {
            alert("Your username or password is incorrect");
          } else {
            alert("500 Internal Server Error");
          }
        }
      },

      signUp: async (username: string, email: string, password: string) => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({
              email: email,
              username: username,
              fullName: username,
              password: password,
            }),
          });

          if (!res.ok) return false;
          return true;
        } catch (e) {
          formatConsoleError("authStore.ts", "signUp", e);
          return false;
        }
      },

      signOut: () => {
        get().clearToken();
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      partialize: (state) => ({
        signInState: state.signInState,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

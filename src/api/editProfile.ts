import { Toast } from "../stores/toastStore";
import { useAuthStore } from "../stores/authStore";
import { fetchWithAuth } from "./fetchWithAuth";

/**
 * Upload profile changes to the backend
 * @param profileData - Profile changes
 */
export const uploadProfileChanges = async (profileData: {
  fullName?: string;
  bio?: string;
  avatarFile?: File | null;
}) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    Toast({
      type: "error",
      title: "Authentication Error",
      message: "You must be signed in to edit your profile.",
    });
    return;
  }

  const formData = new FormData();
  if (profileData.fullName) {
    formData.append("fullName", profileData.fullName);
  }
  if (profileData.bio) {
    formData.append("bio", profileData.bio);
  }
  if (profileData.avatarFile) {
    formData.append("avatar", profileData.avatarFile);
  }

  const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/profile/edit`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
      "x-api-key": import.meta.env.VITE_API_KEY,
    },
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Profile upload failed:", text);
    throw useAuthStore.getState().throwAuthError(res.status);
  }
};

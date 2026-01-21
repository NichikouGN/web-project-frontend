import { useAuthStore } from "../stores/authStore";

interface fetchWithAuthOptions extends RequestInit {
  retry?: boolean;
}

// Store the ongoing refresh promise to prevent concurrent refresh attempts
let ongoingRefresh: Promise<boolean> | null = null;

export const fetchWithAuth = async (
  url: string,
  options: fetchWithAuthOptions = {},
): Promise<Response> => {
  const { retry = true, ...fetchOptions } = options;
  const accessToken = useAuthStore.getState().accessToken;

  console.log(`Fetching with auth. URL: ${url} and Access Token: ${accessToken.slice(-5)}`);
  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...(fetchOptions.headers || {}),
      "x-api-key": import.meta.env.VITE_API_KEY,
    },
  });

  if (res.status === 401 && retry) {
    try {
      // If a refresh is already in progress, wait for it
      if (ongoingRefresh) {
        await ongoingRefresh;
      } else {
        // Start a new refresh and store the promise
        ongoingRefresh = useAuthStore.getState().requestNewAccessToken();
        await ongoingRefresh;
        ongoingRefresh = null; // Clear after completion
      }

      // Retry with the new token
      return fetchWithAuth(url, { ...options, retry: false });
    } catch (error) {
      ongoingRefresh = null; // Clear on error
      throw error;
    }
  }

  return res;
};

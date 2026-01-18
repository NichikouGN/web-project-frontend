import { useAuthStore } from "../stores/authStore";

interface fetchWithAuthOptions extends RequestInit {
  retry?: boolean;
}

export const fetchWithAuth = async (
  url: string,
  options: fetchWithAuthOptions = {}
): Promise<Response> => {
  const { retry = true, ...fetchOptions } = options;
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...(fetchOptions.headers || {}),
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401 && retry) {
    try {
      const tokenRefreshed = await useAuthStore.getState().requestNewAccessToken();
      if (tokenRefreshed) {
        return fetchWithAuth(url, { ...options, retry: false });
      }
    } catch (error) {
      throw error;
    }
  }

  return res;
};

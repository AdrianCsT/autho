import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;
      try {
        // Get refresh token from Next.js API route (server-side cookie access)
        // We're currently using frontend as a bridge!
        const refreshRes = await fetch('/api/auth/refresh-token');
        if (refreshRes.ok) {
          const { refreshToken } = await refreshRes.json();
          await apiClient.post("/auth/refresh", { refreshToken });
          return apiClient(originalRequest);
        }
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };


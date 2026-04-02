import axios from "axios";

import {
  clearAdminToken,
  clearUserSession,
  getAdminToken,
  getUserToken
} from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

api.interceptors.request.use((config) => {
  const authRole = config.authRole;
  const token =
    authRole === "admin"
      ? getAdminToken()
      : authRole === "user"
        ? getUserToken()
        : null;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authRole = error.config?.authRole;

    if (error.response?.status === 401 && authRole === "admin") {
      clearAdminToken();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/admin/login"
      ) {
        window.location.href = "/admin/login";
      }
    }

    if (error.response?.status === 401 && authRole === "user") {
      clearUserSession();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

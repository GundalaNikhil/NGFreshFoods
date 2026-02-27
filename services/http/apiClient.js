import axios from "axios";
import { API_ENDPOINTS } from "../config/endpoints";

let accessToken = null;
let refreshToken = null;
let isRefreshing = false;
let refreshQueue = [];
let onAuthFailure = null;

const processQueue = (error, token = null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  refreshQueue = [];
};

export const setAuthTokens = ({ token, refreshToken: nextRefreshToken } = {}) => {
  accessToken = token || null;
  refreshToken = nextRefreshToken || null;
};

export const setAuthFailureHandler = (handler) => {
  onAuthFailure = typeof handler === "function" ? handler : null;
};

export const apiClient = axios.create({
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (!config.headers.Authorization && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    if (status !== 401 || !refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await apiClient.post(
        API_ENDPOINTS.REFRESH_TOKEN,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      const nextAccessToken = response?.data?.accessToken || response?.data?.jwtToken || null;
      const nextRefreshToken = response?.data?.refreshToken || refreshToken;
      setAuthTokens({ token: nextAccessToken, refreshToken: nextRefreshToken });
      processQueue(null, nextAccessToken);

      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (onAuthFailure) {
        onAuthFailure(refreshError);
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

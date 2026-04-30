import axios from "axios";
import { API_ENDPOINTS } from "../config/endpoints";
import { getDeviceId } from "./deviceId";

let isRefreshing = false;
let refreshQueue = [];
let onAuthFailure = null;
let onAuthUpdate = null;
let authRefreshPromise = null;
let refreshInFlightPromise = null;

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
  void token;
  void nextRefreshToken;
};

export const setAuthFailureHandler = (handler) => {
  onAuthFailure = typeof handler === "function" ? handler : null;
};

export const setAuthUpdateHandler = (handler) => {
  onAuthUpdate = typeof handler === "function" ? handler : null;
};

export const setAuthRefreshPromise = (promise) => {
  authRefreshPromise = promise || null;
};

export const refreshAccessToken = async () => {
  if (refreshInFlightPromise) {
    return refreshInFlightPromise;
  }
  refreshInFlightPromise = (async () => {
    const deviceId = await getDeviceId();
    const response = await axios.post(
      API_ENDPOINTS.REFRESH_TOKEN,
      {},
      {
        headers: {
          ...(deviceId ? { "X-Device-Id": deviceId } : {}),
        },
        timeout: 15000,
        withCredentials: true,
      }
    );
    return response?.data || null;
  })();

  try {
    return await refreshInFlightPromise;
  } finally {
    refreshInFlightPromise = null;
  }
};

export const apiClient = axios.create({
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (authRefreshPromise) {
    try {
      await authRefreshPromise;
    } catch (_error) {
      // If refresh fails, continue and let 401 handler deal with it.
    }
  }
  const deviceId = await getDeviceId();
  if (deviceId) {
    config.headers["X-Device-Id"] = deviceId;
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
    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }
    if (originalRequest.url?.includes(API_ENDPOINTS.REFRESH_TOKEN)) {
      return Promise.reject(error);
    }
    if (status !== 401) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(() => {
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await refreshAccessToken();
      if (onAuthUpdate) {
        onAuthUpdate();
      }
      processQueue(null, true);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAuthTokens({});
      if (onAuthFailure) {
        const restored = await onAuthFailure(refreshError);
        if (restored) {
          return apiClient(originalRequest);
        }
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

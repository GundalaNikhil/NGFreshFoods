import axios from "axios";
import { API_ENDPOINTS } from "../config/endpoints";
import { getDeviceId } from "./deviceId";

let accessToken = null;
let refreshToken = null;
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
  accessToken = token || null;
  refreshToken = nextRefreshToken || null;
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

export const refreshAccessToken = async (refreshTokenValue) => {
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
          Authorization: `Bearer ${refreshTokenValue}`,
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
    if (originalRequest.url?.includes(API_ENDPOINTS.REFRESH_TOKEN)) {
      return Promise.reject(error);
    }
    if (status !== 401) {
      return Promise.reject(error);
    }
    if (!refreshToken) {
      setAuthTokens({});
      if (onAuthFailure) {
        onAuthFailure(error);
      }
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
      const response = await refreshAccessToken(refreshToken);

      const nextAccessToken = response?.accessToken || response?.jwtToken || null;
      const nextRefreshToken = response?.refreshToken || refreshToken;
      setAuthTokens({ token: nextAccessToken, refreshToken: nextRefreshToken });
      if (onAuthUpdate) {
        onAuthUpdate({ token: nextAccessToken, refreshToken: nextRefreshToken });
      }
      processQueue(null, nextAccessToken);

      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAuthTokens({});
      if (onAuthFailure) {
        onAuthFailure(refreshError);
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

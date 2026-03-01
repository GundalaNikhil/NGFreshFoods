import { API_ENDPOINTS } from "../config/endpoints";
import { apiClient } from "../http/apiClient";

const normalizeError = (error) => {
  if (error.response) {
    return {
      success: false,
      error: {
        type: "server_error",
        message:
          error.response?.data?.customMessage ||
          error.response?.data?.message ||
          "Request failed",
        details: error.response.data,
      },
    };
  }

  if (error.request) {
    return {
      success: false,
      error: {
        type: "network_error",
        message:
          "Unable to connect to server. Please check your internet connection.",
        details: error.request,
      },
    };
  }

  return {
    success: false,
    error: {
      type: "request_error",
      message: error.message || "Something went wrong. Please try again.",
      details: null,
    },
  };
};

let couponsCache = null;
let couponsCacheAt = 0;
const COUPONS_CACHE_TTL_MS = 10 * 60 * 1000;

export const fetchActiveCoupons = async ({ forceRefresh = false } = {}) => {
  const now = Date.now();
  if (!forceRefresh && couponsCache && now - couponsCacheAt < COUPONS_CACHE_TTL_MS) {
    return { success: true, data: couponsCache };
  }
  try {
    const response = await apiClient.get(API_ENDPOINTS.COUPONS_ACTIVE);
    const data = response?.data || [];
    couponsCache = data;
    couponsCacheAt = now;
    return { success: true, data };
  } catch (error) {
    return normalizeError(error);
  }
};

export const validateCoupon = async ({ code, orderAmount }) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.COUPONS_VALIDATE, {
      code,
      orderAmount,
    });
    return { success: true, data: response?.data || null };
  } catch (error) {
    return normalizeError(error);
  }
};

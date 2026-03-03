import { apiClient } from "../http/apiClient";
import { API_ENDPOINTS } from "../config/endpoints";

/**
 * Payment BFF – orchestrates order creation, payment verification, and status polling.
 * All functions return { success, data, error } for consistent error handling.
 */

const wrap = async (promise) => {
  try {
    const response = await promise;
    return { success: true, data: response?.data || null, error: null };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.customMessage ||
      error?.message ||
      "Something went wrong";
    const errorCode =
      error?.response?.data?.error ||
      error?.response?.data?.errorCode ||
      "UNKNOWN";
    return {
      success: false,
      data: null,
      error: { message, code: errorCode, status: error?.response?.status },
    };
  }
};

/**
 * Create an order from the current cart state.
 * Returns razorpayOrderId, razorpayKeyId, amount needed to open Razorpay checkout.
 */
export const createOrder = async (orderPayload) => {
  return wrap(apiClient.post(API_ENDPOINTS.ORDER_CREATE, orderPayload));
};

/**
 * Verify payment after Razorpay Checkout callback.
 * Sends the razorpay payment details for server-side HMAC verification.
 */
export const verifyPayment = async (verificationPayload) => {
  return wrap(apiClient.post(API_ENDPOINTS.PAYMENT_VERIFY, verificationPayload));
};

/**
 * Poll payment status for an order (backup verification).
 */
export const getPaymentStatus = async (orderId) => {
  return wrap(apiClient.get(`${API_ENDPOINTS.PAYMENT_STATUS}/${orderId}/status`));
};

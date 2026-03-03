import { Platform } from "react-native";

const defaultApiBaseUrl =
  Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || defaultApiBaseUrl;
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || "v1";

export const API_ENDPOINTS = {
  // Auth
  FIREBASE_SIGNUP_OTP: `${API_BASE_URL}/api/${API_VERSION}/onboarding/firebase/register-otp`,
  FIREBASE_LOGIN_OTP: `${API_BASE_URL}/api/${API_VERSION}/onboarding/firebase/login-otp`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/${API_VERSION}/onboarding/refresh-token`,

  // Cart
  CART: `${API_BASE_URL}/api/${API_VERSION}/cart`,
  CART_MERGE: `${API_BASE_URL}/api/${API_VERSION}/cart/merge`,

  // User
  PROFILE_ME: `${API_BASE_URL}/api/${API_VERSION}/users/me`,
  PROFILE_UPDATE: `${API_BASE_URL}/api/${API_VERSION}/users/me/profile`,
  ADDRESSES_ME: `${API_BASE_URL}/api/${API_VERSION}/users/me/addresses`,
  ADDRESS_UPDATE: (addressId) =>
    `${API_BASE_URL}/api/${API_VERSION}/users/me/addresses/${addressId}`,
  ADDRESS_DELETE: (addressId) =>
    `${API_BASE_URL}/api/${API_VERSION}/users/me/addresses/${addressId}`,

  // Orders
  ORDERS_ME: `${API_BASE_URL}/api/${API_VERSION}/orders/my`,
  ORDER_CREATE: `${API_BASE_URL}/api/${API_VERSION}/orders/create`,

  // Payments
  PAYMENT_VERIFY: `${API_BASE_URL}/api/${API_VERSION}/payments/confirmPayment`,
  PAYMENT_STATUS: `${API_BASE_URL}/api/${API_VERSION}/payments`,

  // Coupons
  COUPONS_ACTIVE: `${API_BASE_URL}/api/${API_VERSION}/coupons/active`,
  COUPONS_VALIDATE: `${API_BASE_URL}/api/${API_VERSION}/coupons/validate`,

  // Products
  PRODUCTS: `${API_BASE_URL}/api/${API_VERSION}/products`,
  CATEGORIES: `${API_BASE_URL}/api/${API_VERSION}/categories`,
};

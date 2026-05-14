import { Platform } from "react-native";

const devApiBaseUrl =
  Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_BASE_URL = configuredApiBaseUrl || (__DEV__ ? devApiBaseUrl : null);

if (!API_BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_BASE_URL must be set for non-development builds."
  );
}

if (!__DEV__ && !API_BASE_URL.startsWith("https://")) {
  throw new Error(
    "Production API base URL must use HTTPS."
  );
}

const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || "v1";

export const API_ENDPOINTS = {
  // Auth
  FIREBASE_SIGNUP_OTP: `${API_BASE_URL}/api/${API_VERSION}/onboarding/firebase/register-otp`,
  FIREBASE_LOGIN_OTP: `${API_BASE_URL}/api/${API_VERSION}/onboarding/firebase/login-otp`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/${API_VERSION}/onboarding/refresh-token`,
  LOGOUT: `${API_BASE_URL}/api/${API_VERSION}/onboarding/logout`,
  AUTH_STATUS: `${API_BASE_URL}/api/${API_VERSION}/onboarding/auth-status`,

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

  // Notifications
  NOTIFICATION_REGISTER_DEVICE: `${API_BASE_URL}/api/${API_VERSION}/notifications/devices/register`,
  NOTIFICATION_UNREGISTER_DEVICE: `${API_BASE_URL}/api/${API_VERSION}/notifications/devices/current`,
  NOTIFICATION_PREFERENCES: `${API_BASE_URL}/api/${API_VERSION}/notifications/preferences`,
  NOTIFICATION_FEED: `${API_BASE_URL}/api/${API_VERSION}/notifications/feed`,

  // Orders
  ORDERS_ME: `${API_BASE_URL}/api/${API_VERSION}/orders/my`,
  ORDER_CREATE: `${API_BASE_URL}/api/${API_VERSION}/orders/create`,
  ORDER_DETAIL: (orderId) =>
    `${API_BASE_URL}/api/${API_VERSION}/orders/${orderId}`,

  // Payments
  PAYMENT_VERIFY: `${API_BASE_URL}/api/${API_VERSION}/payments/confirmPayment`,
  PAYMENT_STATUS: `${API_BASE_URL}/api/${API_VERSION}/payments`,
  PAYMENT_RETRY: (orderId) =>
    `${API_BASE_URL}/api/${API_VERSION}/payments/${orderId}/retry`,

  // Coupons
  COUPONS_ACTIVE: `${API_BASE_URL}/api/${API_VERSION}/coupons/active`,
  COUPONS_VALIDATE: `${API_BASE_URL}/api/${API_VERSION}/coupons/validate`,

  // Products
  PRODUCTS: `${API_BASE_URL}/api/${API_VERSION}/products`,
  CATEGORIES: `${API_BASE_URL}/api/${API_VERSION}/categories`,

  // Shop (public)
  SHOP_STATUS: `${API_BASE_URL}/api/${API_VERSION}/shop/status`,

  // Admin
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/${API_VERSION}/admin/dashboard`,
  ADMIN_ORDERS: `${API_BASE_URL}/api/${API_VERSION}/admin/orders`,
  ADMIN_ORDER_STATUS: (orderId) =>
    `${API_BASE_URL}/api/${API_VERSION}/admin/orders/${orderId}/status`,
  ADMIN_ORDER_REFUND: (orderId) =>
    `${API_BASE_URL}/api/${API_VERSION}/admin/orders/${orderId}/refund`,
  ADMIN_ORDER_COD_RECEIVED: (orderId) =>
    `${API_BASE_URL}/api/${API_VERSION}/admin/orders/${orderId}/cod-received`,
  ADMIN_PRODUCTS: `${API_BASE_URL}/api/${API_VERSION}/admin/products`,
  ADMIN_PRODUCT_UPDATE: (productId) =>
    `${API_BASE_URL}/api/${API_VERSION}/admin/products/${productId}`,
  ADMIN_PRODUCT_DELETE: (productId) =>
    `${API_BASE_URL}/api/${API_VERSION}/admin/products/${productId}`,
  ADMIN_PRODUCT_STOCK: (productId) =>
    `${API_BASE_URL}/api/${API_VERSION}/admin/products/${productId}/stock`,
  ADMIN_USERS: `${API_BASE_URL}/api/${API_VERSION}/admin/users`,
  ADMIN_BROADCAST: `${API_BASE_URL}/api/${API_VERSION}/admin/notifications/broadcast`,
  ADMIN_SHOP_SETTINGS: `${API_BASE_URL}/api/${API_VERSION}/admin/shop/settings`,
  ADMIN_AUDIT_LOG: `${API_BASE_URL}/api/${API_VERSION}/admin/audit-log`,

  // Admin Coupons
  ADMIN_COUPONS: `${API_BASE_URL}/api/${API_VERSION}/admin/coupons`,
  ADMIN_COUPON_UPDATE: (couponId) =>
    `${API_BASE_URL}/api/${API_VERSION}/admin/coupons/${couponId}`,
  ADMIN_COUPON_DELETE: (couponId) =>
    `${API_BASE_URL}/api/${API_VERSION}/admin/coupons/${couponId}`,
};

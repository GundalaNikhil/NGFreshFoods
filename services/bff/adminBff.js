import { apiClient } from "../http/apiClient";
import { API_ENDPOINTS } from "../config/endpoints";

// ── Dashboard ──

export const fetchDashboard = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN_DASHBOARD);
  return response?.data || {};
};

// ── Orders ──

export const fetchAllOrders = async (status = null) => {
  const params = status ? { status } : {};
  const response = await apiClient.get(API_ENDPOINTS.ADMIN_ORDERS, { params });
  return response?.data || [];
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.patch(API_ENDPOINTS.ADMIN_ORDER_STATUS(orderId), { status });
  return response?.data || {};
};

// ── Products ──

export const fetchAllProducts = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN_PRODUCTS);
  return response?.data || [];
};

export const createProduct = async (productData) => {
  const response = await apiClient.post(API_ENDPOINTS.ADMIN_PRODUCTS, productData);
  return response?.data || {};
};

export const updateProduct = async (productId, productData) => {
  const response = await apiClient.put(API_ENDPOINTS.ADMIN_PRODUCT_UPDATE(productId), productData);
  return response?.data || {};
};

export const updateStock = async (productId, stockQuantity) => {
  const response = await apiClient.patch(API_ENDPOINTS.ADMIN_PRODUCT_STOCK(productId), { stockQuantity });
  return response?.data || {};
};

export const deleteProduct = async (productId) => {
  const response = await apiClient.delete(API_ENDPOINTS.ADMIN_PRODUCT_DELETE(productId));
  return response?.data || {};
};

// ── Users ──

export const fetchAllUsers = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN_USERS);
  return response?.data || [];
};

// ── Broadcast ──

export const broadcastNotification = async ({ title, body, audienceType }) => {
  const response = await apiClient.post(API_ENDPOINTS.ADMIN_BROADCAST, { title, body, audienceType });
  return response?.data || {};
};

// ── Shop Settings ──

export const fetchShopSettings = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN_SHOP_SETTINGS);
  return response?.data || {};
};

export const updateShopSettings = async (settings) => {
  const response = await apiClient.put(API_ENDPOINTS.ADMIN_SHOP_SETTINGS, { settings });
  return response?.data || {};
};

// ── Coupons (Admin) ──

export const fetchAllCoupons = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN_COUPONS);
  return response?.data || [];
};

export const createCoupon = async (couponData) => {
  const response = await apiClient.post(API_ENDPOINTS.ADMIN_COUPONS, couponData);
  return response?.data || {};
};

export const updateCoupon = async (couponId, couponData) => {
  const response = await apiClient.put(API_ENDPOINTS.ADMIN_COUPON_UPDATE(couponId), couponData);
  return response?.data || {};
};

export const deleteCoupon = async (couponId) => {
  const response = await apiClient.delete(API_ENDPOINTS.ADMIN_COUPON_DELETE(couponId));
  return response?.data || {};
};

// ── Audit Log ──

export const fetchAuditLog = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN_AUDIT_LOG);
  return response?.data || [];
};

import { apiClient } from "../http/apiClient";
import { API_ENDPOINTS } from "../config/endpoints";

const normalizeNumber = (value) =>
  typeof value === "number" && !Number.isNaN(value) ? value : 0;

const toPayloadItem = (item) => {
  if (!item) return null;
  const productId = item.id || item.productId || null;
  if (!productId) {
    return null;
  }
  return {
    productId,
    clientProductId: item.productId || item.id || null,
    productName: item.name || "Item",
    imageUrl: item.image_url || item.imageUrl || null,
    unitPrice: normalizeNumber(item.itemPrice || item.base_price || 0),
    totalPrice: normalizeNumber(item.totalPrice || 0),
    quantity: item.quantity || 0,
    customizations: item.customizations ? JSON.stringify(item.customizations) : null,
  };
};

export const buildCartPayload = (items = []) => ({
  items: items.map(toPayloadItem).filter(Boolean),
});

export const fetchCart = async () => {
  const response = await apiClient.get(API_ENDPOINTS.CART);
  return response?.data || null;
};

export const replaceCart = async (items = []) => {
  const response = await apiClient.put(API_ENDPOINTS.CART, buildCartPayload(items));
  return response?.data || null;
};

export const mergeCart = async (items = []) => {
  const response = await apiClient.post(API_ENDPOINTS.CART_MERGE, buildCartPayload(items));
  return response?.data || null;
};

export const clearCart = async () => {
  await apiClient.delete(API_ENDPOINTS.CART);
};

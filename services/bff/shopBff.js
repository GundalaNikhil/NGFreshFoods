import { apiClient } from "../http/apiClient";
import { API_ENDPOINTS } from "../config/endpoints";

export const fetchShopStatus = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SHOP_STATUS);
    return { success: true, data: response?.data || {} };
  } catch (error) {
    console.warn("[ShopBff] Failed to fetch shop status:", error?.message);
    // Default to open if API fails — don't block customers
    return { success: false, data: { isOpen: true, message: "", openTime: "08:00", closeTime: "22:00" } };
  }
};

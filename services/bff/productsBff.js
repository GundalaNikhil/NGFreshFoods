import { apiClient } from "../http/apiClient";
import { API_ENDPOINTS } from "../config/endpoints";

export const fetchProducts = async () => {
  const response = await apiClient.get(API_ENDPOINTS.PRODUCTS);
  return response?.data || [];
};

export const fetchCategories = async () => {
  const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
  return response?.data || [];
};

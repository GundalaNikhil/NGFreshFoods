import { apiClient } from "../http/apiClient";
import { API_ENDPOINTS } from "../config/endpoints";
import { getCachedData, setCachedData } from "../../utils/localCache";

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export const fetchProducts = async () => {
  const cacheKey = "products_list_all";
  const cached = await getCachedData(cacheKey, CACHE_TTL_MS);
  if (cached) return cached;

  const response = await apiClient.get(API_ENDPOINTS.PRODUCTS);
  const data = response?.data || [];
  if (data.length > 0) setCachedData(cacheKey, data);
  return data;
};

export const fetchCategories = async () => {
  const cacheKey = "categories_list_all";
  const cached = await getCachedData(cacheKey, CACHE_TTL_MS);
  if (cached) return cached;

  const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
  const data = response?.data || [];
  if (data.length > 0) setCachedData(cacheKey, data);
  return data;
};

import AsyncStorage from "@react-native-async-storage/async-storage";

const cacheKey = (key) => `cache:${key}`;

export const getCachedData = async (key, maxAgeMs) => {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(key));
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached?.cachedAt || Date.now() - cached.cachedAt > maxAgeMs) {
      return null;
    }

    return cached.value ?? null;
  } catch (error) {
    console.warn(`[localCache] Failed to read ${key}`, error?.message || error);
    return null;
  }
};

export const setCachedData = async (key, value) => {
  try {
    await AsyncStorage.setItem(
      cacheKey(key),
      JSON.stringify({ cachedAt: Date.now(), value })
    );
  } catch (error) {
    console.warn(`[localCache] Failed to write ${key}`, error?.message || error);
  }
};

export const clearCachedData = async (key) => {
  try {
    await AsyncStorage.removeItem(cacheKey(key));
  } catch (error) {
    console.warn(`[localCache] Failed to clear ${key}`, error?.message || error);
  }
};

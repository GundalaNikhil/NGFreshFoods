import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "device_id";
let cachedDeviceId = null;

const generateDeviceId = () => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${Platform.OS}-${Date.now()}-${randomPart}`;
};

export const getDeviceId = async () => {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }
  let storedId = null;
  try {
    storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  } catch (_error) {
    storedId = null;
  }

  if (!storedId) {
    storedId = generateDeviceId();
    try {
      await AsyncStorage.setItem(DEVICE_ID_KEY, storedId);
    } catch (_error) {
      // If storage fails, still use generated ID for this session.
    }
  }

  cachedDeviceId = storedId;
  return cachedDeviceId;
};

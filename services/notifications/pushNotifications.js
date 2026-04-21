import Constants from "expo-constants";
import { PermissionsAndroid, Platform } from "react-native";
import messaging, { AuthorizationStatus } from "@react-native-firebase/messaging";

const normalizePermissionStatus = (status) => {
  switch (status) {
    case AuthorizationStatus.AUTHORIZED:
    case AuthorizationStatus.PROVISIONAL:
      return "GRANTED";
    case AuthorizationStatus.DENIED:
      return "DENIED";
    default:
      return "UNDETERMINED";
  }
};

export const requestPushPermission = async () => {
  if (Platform.OS === "android") {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED ? "GRANTED" : "DENIED";
    }
    return "GRANTED";
  }

  const status = await messaging().requestPermission();
  return normalizePermissionStatus(status);
};

export const getPushRegistration = async () => {
  await messaging().registerDeviceForRemoteMessages();
  const permissionStatus = await requestPushPermission();
  if (permissionStatus !== "GRANTED") {
    return {
      permissionStatus,
      fcmToken: null,
    };
  }

  const fcmToken = await messaging().getToken();
  return {
    permissionStatus,
    fcmToken,
    platform: Platform.OS,
    appVersion:
      Constants.expoConfig?.version ||
      Constants.nativeAppVersion ||
      "1.0.0",
    locale:
      Intl.DateTimeFormat().resolvedOptions().locale ||
      "en-IN",
  };
};

export const subscribeToForegroundMessages = (handler) =>
  messaging().onMessage(handler);

export const subscribeToTokenRefresh = (handler) =>
  messaging().onTokenRefresh(handler);

export const subscribeToOpenedNotifications = (handler) =>
  messaging().onNotificationOpenedApp(handler);

export const getInitialNotification = () =>
  messaging().getInitialNotification();

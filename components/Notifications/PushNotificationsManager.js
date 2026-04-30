import React, { useEffect, useRef } from "react";
import Toast from "react-native-toast-message";
import { useRecoilState } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import { notificationAtom } from "../../recoil/atoms/notificationAtom";
import {
  registerDevicePushToken,
} from "../../services/bff/accountBff";
import {
  getInitialNotification,
  getPushRegistration,
  subscribeToForegroundMessages,
  subscribeToOpenedNotifications,
  subscribeToTokenRefresh,
} from "../../services/notifications/pushNotifications";

const toIntent = (remoteMessage) => {
  const data = remoteMessage?.data || {};
  return {
    orderId: data.orderId || null,
    targetScreen: data.targetScreen || data.screen || null,
    deepLink: data.deepLink || null,
    title: remoteMessage?.notification?.title || data.title || null,
  };
};

const PushNotificationsManager = () => {
  const [auth] = useRecoilState(authAtom);
  const [notificationState, setNotificationState] = useRecoilState(notificationAtom);
  const lastSyncedTokenRef = useRef(null);

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      return undefined;
    }

    let isMounted = true;

    const syncToken = async (explicitToken = null) => {
      const registration = explicitToken
        ? {
            fcmToken: explicitToken,
            permissionStatus: notificationState.permissionStatus || "GRANTED",
            platform: null,
            appVersion: null,
            locale: null,
          }
        : await getPushRegistration();

      if (!isMounted) {
        return;
      }

      setNotificationState((prev) => ({
        ...prev,
        permissionStatus: registration.permissionStatus || prev.permissionStatus,
      }));

      if (!registration.fcmToken || lastSyncedTokenRef.current === registration.fcmToken) {
        return;
      }

      const response = await registerDevicePushToken({
        payload: registration,
      });

      if (response.success) {
        lastSyncedTokenRef.current = registration.fcmToken;
        setNotificationState((prev) => ({
          ...prev,
          lastTokenSyncAt: new Date().toISOString(),
        }));
      }
    };

    syncToken();

    const unsubscribeMessage = subscribeToForegroundMessages((remoteMessage) => {
      const intent = toIntent(remoteMessage);
      setNotificationState((prev) => ({
        ...prev,
        intent,
        intentUpdatedAt: new Date().toISOString(),
      }));

      Toast.show({
        type: "success",
        text1: intent.title || "Fresh update",
        text2: remoteMessage?.notification?.body || "Check your notifications for details.",
      });
    });

    const unsubscribeOpened = subscribeToOpenedNotifications((remoteMessage) => {
      const intent = toIntent(remoteMessage);
      setNotificationState((prev) => ({
        ...prev,
        intent,
        intentUpdatedAt: new Date().toISOString(),
      }));
    });

    getInitialNotification().then((remoteMessage) => {
      if (!remoteMessage || !isMounted) {
        return;
      }
      const intent = toIntent(remoteMessage);
      setNotificationState((prev) => ({
        ...prev,
        intent,
        intentUpdatedAt: new Date().toISOString(),
      }));
    });

    const unsubscribeRefresh = subscribeToTokenRefresh((token) => {
      syncToken(token);
    });

    return () => {
      isMounted = false;
      unsubscribeMessage();
      unsubscribeOpened();
      unsubscribeRefresh();
    };
  }, [auth?.isAuthenticated, notificationState.permissionStatus, setNotificationState]);

  return null;
};

export default PushNotificationsManager;

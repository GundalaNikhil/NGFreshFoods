import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, TextInput, View, ActivityIndicator, Platform } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Linking } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { authAtom } from "../recoil/atoms/authAtom";
import { profileAtom } from "../recoil/atoms/profileAtom";
import { cartState } from "../recoil/atoms/cartAtom";
import { auth } from "../services/firebaseConfig";
import { onAuthStateChanged } from "@react-native-firebase/auth";
import Toast from "react-native-toast-message";
import AccountScreen from "../components/bottomNavScreens/AccountScreen";
import CartScreen from "../components/bottomNavScreens/CartScreen";
import HomeScreen from "../components/bottomNavScreens/HomeScreen";
import ProductsScreen from "../components/bottomNavScreens/ProductsScreen";
import PushNotificationsManager from "../components/Notifications/PushNotificationsManager";
import "../global.css";
import AuthScreen from "../components/Login/AuthScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setAuthFailureHandler,
  setAuthUpdateHandler,
} from "../services/http/apiClient";
import { fetchAuthStatus } from "../services/bff/accountBff";
import { loginWithFirebaseOtpBff } from "../services/bff/authBff";
import CartSyncManager from "../providers/CartSyncManager";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import { Icon } from "@rneui/themed";

// Admin screen imports
import AdminDashboardScreen from "../components/bottomNavScreens/AdminDashboardScreen";
import AdminOrdersScreen from "../components/bottomNavScreens/AdminOrdersScreen";
import AdminProductsScreen from "../components/bottomNavScreens/AdminProductsScreen";
import AdminMoreScreenWrapper from "../components/bottomNavScreens/AdminMoreScreenWrapper";

import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: false,
});

// ── Brand Design Tokens ──
const BRAND_RED = "#E23744";
const BRAND_ORANGE = "#FC8019";
const TAB_BAR_BG = "#1E1E2E";
const TAB_INACTIVE = "#7C7C8A";
const BASE_FONT = "Poppins_500Medium";

const HomeIcon = ({ size, color }) => (
  <FontAwesome5 name="home" size={size} color={color === TAB_INACTIVE ? color : "#FF6B6B"} />
);
const DrumstickIcon = ({ size, color }) => (
  <Icon type="material-community" name="food-drumstick" size={size} color={color} />
);
const AccountIcon = ({ size, color }) => (
  <FontAwesome5 name="user-circle" size={size} color={color === TAB_INACTIVE ? color : null} />
);
const CartIcon = ({ size, color }) => (
  <FontAwesome5 name="shopping-cart" size={size} color={color === TAB_INACTIVE ? color : null} />
);
const WhatsAppIcon = ({ size, color }) => (
  <FontAwesome5 name="whatsapp" size={size + 2} color={color === TAB_INACTIVE ? "#25D366" : color} />
);

// ── Admin Tab Icons ──
const AdminDashboardIcon = ({ size, color }) => (
  <FontAwesome5 name="chart-line" size={size} color={color} />
);
const AdminOrdersIcon = ({ size, color }) => (
  <FontAwesome5 name="clipboard-list" size={size} color={color} />
);
const AdminProductsIcon = ({ size, color }) => (
  <FontAwesome5 name="box-open" size={size} color={color} />
);
const AdminMoreIcon = ({ size, color }) => (
  <FontAwesome5 name="ellipsis-h" size={size} color={color} />
);

// Screen dimensions for responsive design
const { height } = Dimensions.get("window");
const isSmallScreen = height < 700;

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: HomeIcon,
  Products: DrumstickIcon,
  Account: AccountIcon,
  Cart: CartIcon,
};

const ADMIN_TAB_ICONS = {
  Dashboard: AdminDashboardIcon,
  Orders: AdminOrdersIcon,
  Products: AdminProductsIcon,
  More: AdminMoreIcon,
};

// ── Premium Dark Floating Tab Bar (Customer) ──
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const cart = useRecoilValue(cartState);
  const itemCount = cart?.items?.length || 0;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: TAB_BAR_BG,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingTop: 6,
        paddingBottom: Platform.OS === "ios" ? (isSmallScreen ? 10 : 18) : 8,
        paddingHorizontal: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const IconComponent = TAB_ICONS[route.name];
          const label = route.name;

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const tabEl = (
            <TabItem
              key={route.name}
              focused={focused}
              label={label}
              IconComponent={IconComponent}
              onPress={onPress}
              badge={route.name === "Cart" && itemCount > 0 ? itemCount : 0}
            />
          );

          if (route.name === "Products") {
            return (
              <React.Fragment key={route.name}>
                {tabEl}
                <TabItem
                  key="WhatsApp"
                  focused={false}
                  label="Order on WA"
                  IconComponent={WhatsAppIcon}
                  onPress={() => {
                    const message = encodeURIComponent("Hey NGFreshFarms! 🥩🍗\n\nI'd love to place an order for fresh meat & eggs — delivered straight to my doorstep! 🚀\n\nCould you share today's menu?");
                    Linking.openURL(`whatsapp://send?phone=919515353625&text=${message}`).catch(() => {
                      Toast.show({ type: "error", text1: "WhatsApp not installed" });
                    });
                  }}
                  badge={0}
                />
              </React.Fragment>
            );
          }

          return tabEl;
        })}
      </View>
    </View>
  );
};

// ── Admin Tab Bar ──
const AdminTabBar = ({ state, descriptors, navigation }) => (
  <View
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: TAB_BAR_BG,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingTop: 6,
      paddingBottom: Platform.OS === "ios" ? (isSmallScreen ? 10 : 18) : 8,
      paddingHorizontal: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 16,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const IconComponent = ADMIN_TAB_ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.name}
            focused={focused}
            label={route.name}
            IconComponent={IconComponent}
            onPress={onPress}
            badge={0}
          />
        );
      })}
    </View>
  </View>
);

const TabItem = ({ focused, label, IconComponent, onPress, badge = 0 }) => {
  const dotScale = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    dotScale.value = withSpring(focused ? 1 : 0, { damping: 14, stiffness: 160 });
  }, [focused]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    opacity: dotScale.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 4,
        }}
      >
        {/* Icon */}
        <View style={{ position: "relative" }}>
          <IconComponent
            size={20}
            color={focused ? "#FFFFFF" : TAB_INACTIVE}
          />
          {badge > 0 && (
            <View
              style={{
                position: "absolute",
                top: -8,
                right: -12,
                backgroundColor: "#E23744",
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 5,
                borderWidth: 2.5,
                borderColor: TAB_BAR_BG,
              }}
            >
              <Text style={{ color: "white", fontSize: 10, fontWeight: "900", lineHeight: 12 }}>
                {badge > 9 ? "9+" : badge}
              </Text>
            </View>
          )}
        </View>

        <Text
          numberOfLines={1}
          style={{
            marginTop: 2,
            fontSize: 9,
            fontWeight: focused ? "800" : "600",
            color: focused ? "#FFFFFF" : TAB_INACTIVE,
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>

        {/* Active dot indicator */}
        <Reanimated.View
          style={[
            {
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: BRAND_ORANGE,
              marginTop: 2,
            },
            dotStyle,
          ]}
        />
      </View>
    </Pressable>
  );
};

// The main App routing logic inside RecoilRoot
function RootNavigator() {
  const [authState, setAuthState] = useRecoilState(authAtom);
  const [profile, setProfile] = useRecoilState(profileAtom);
  const [initializing, setInitializing] = useState(true);
  const isAdmin = profile.role === "ADMIN";

  const initRef = useRef(true);
  const sessionRestoreRef = useRef(null);

  useEffect(() => {
    console.log("[Root] State - initializing:", initializing, "isHydrated:", authState?.isHydrated, "isAuthenticated:", authState?.isAuthenticated);
  }, [initializing, authState?.isHydrated, authState?.isAuthenticated]);

  const clearLocalAuth = React.useCallback(() => {
    setAuthState({ isAuthenticated: false, isHydrated: true });
    AsyncStorage.removeItem("auth");
  }, [setAuthState]);

  const restoreBackendSessionFromFirebase = React.useCallback(async (firebaseUser, options = {}) => {
    if (!firebaseUser) {
      clearLocalAuth();
      return false;
    }

    if (sessionRestoreRef.current) {
      return sessionRestoreRef.current;
    }

    sessionRestoreRef.current = (async () => {
      const keepExistingSession = options.keepExistingSession !== false;

      try {
        const statusResponse = await fetchAuthStatus();
        if (statusResponse.success) {
          setProfile(statusResponse.data.profile);
          setAuthState({ isAuthenticated: true, isHydrated: true });
          return true;
        }
      } catch (_error) {
        // Fall through to Firebase-backed session restore.
      }

      try {
        const idToken = await firebaseUser.getIdToken(true);
        const loginResponse = await loginWithFirebaseOtpBff({ idToken });
        if (loginResponse.success) {
          if (loginResponse.data.profile.isNewUser) {
            // New user needs to complete profile, don't set as authenticated yet
            return false;
          }
          setProfile(loginResponse.data.profile);
          setAuthState({ isAuthenticated: true, isHydrated: true });
          return true;
        }

        const status = loginResponse.error?.details?.status || loginResponse.error?.details?.statusCode;
        if (status === 401 || status === 403) {
          clearLocalAuth();
          return false;
        }
      } catch (_error) {
        // Network/backend failures should not sign out a valid Firebase user.
      }

      if (keepExistingSession) {
        setAuthState({ isAuthenticated: true, isHydrated: true });
        return true;
      }

      clearLocalAuth();
      return false;
    })();

    try {
      return await sessionRestoreRef.current;
    } finally {
      sessionRestoreRef.current = null;
    }
  }, [clearLocalAuth, setAuthState, setProfile]);

  // Listen for Firebase Auth state changes — subscribe ONCE
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth(), async (user) => {
      console.log("[Root] Firebase onAuthStateChanged - User:", user ? user.email || user.phoneNumber : "null");
      if (user) {
        await restoreBackendSessionFromFirebase(user, { keepExistingSession: true });
      } else {
        clearLocalAuth();
      }
      if (initRef.current) {
        initRef.current = false;
      }
      setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearLocalAuth, restoreBackendSessionFromFirebase]);

  useEffect(() => {
    setAuthFailureHandler(async () => {
      const firebaseUser = auth().currentUser;
      if (firebaseUser) {
        const restored = await restoreBackendSessionFromFirebase(firebaseUser, { keepExistingSession: true });
        if (!restored) {
          Toast.show({
            type: "error",
            text1: "Session expired",
            text2: "Please log in again.",
          });
        }
        return restored;
      }

      Toast.show({
        type: "error",
        text1: "Session expired",
        text2: "Please log in again.",
      });
      clearLocalAuth();
      return false;
    });
    setAuthUpdateHandler(() => {
      setAuthState((prev) => ({ ...prev, isAuthenticated: true, isHydrated: true }));
    });
  }, [clearLocalAuth, restoreBackendSessionFromFirebase, setAuthState]);

  if (initializing || !authState.isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color={BRAND_RED} />
      </View>
    );
  }

  // Gatekeeping: If not authenticated, render the premium Auth flow
  if (!authState.isAuthenticated) {
    return <AuthScreen />;
  }

  // ── Admin Tab Navigator ──
  if (isAdmin) {
    return (
      <>
        <CartSyncManager />
        <PushNotificationsManager />
        <Tab.Navigator
          tabBar={(props) => <AdminTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
          <Tab.Screen name="Orders" component={AdminOrdersScreen} />
          <Tab.Screen name="Products" component={AdminProductsScreen} />
          <Tab.Screen name="More" component={AdminMoreScreenWrapper} />
        </Tab.Navigator>
      </>
    );
  }

  // ── Customer Tab Navigator ──
  return (
    <>
    <CartSyncManager />
    <PushNotificationsManager />
    <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Products" component={ProductsScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
        <Tab.Screen name="Cart" component={CartScreen} />
      </Tab.Navigator>
    </>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

function Index() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    const baseTextStyle = {
      fontFamily: BASE_FONT,
      color: "#1C1C1C",
      letterSpacing: 0.1,
    };

    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.style = [baseTextStyle, Text.defaultProps.style];

    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.style = [baseTextStyle, TextInput.defaultProps.style];
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color={BRAND_RED} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <RootNavigator />
      </RecoilRoot>
      <Toast />
    </QueryClientProvider>
  );
}

export default Sentry.wrap(Index);

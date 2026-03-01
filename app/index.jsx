import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import React, { useEffect, useRef, useState } from "react";
import { AppState, Dimensions, Pressable, Text, View, ActivityIndicator } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { RecoilRoot, useRecoilState } from "recoil";
import { authAtom } from "../recoil/atoms/authAtom";
import { auth } from "../services/firebaseConfig";
import { onAuthStateChanged } from "@react-native-firebase/auth";
import Toast from "react-native-toast-message";
import AccountScreen from "../components/bottomNavScreens/AccountScreen";
import CartScreen from "../components/bottomNavScreens/CartScreen";
import HomeScreen from "../components/bottomNavScreens/HomeScreen";
import ProductsScreen from "../components/bottomNavScreens/ProductsScreen";
import "../global.css";
import AuthScreen from "../components/Login/AuthScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  refreshAccessToken,
  setAuthFailureHandler,
  setAuthRefreshPromise,
  setAuthTokens,
  setAuthUpdateHandler,
} from "../services/http/apiClient";

// Screen dimensions for responsive design
const { height } = Dimensions.get("window");
const isSmallScreen = height < 700;

const Tab = createBottomTabNavigator();

// Custom tab button with Licious-style animation and feedback
const TabButton = ({
  children = null,
  onPress = () => {},
  accessibilityState = {},
}) => {
  const focused = accessibilityState.selected;
  const scale = useSharedValue(1);

  useEffect(() => {
    // Smoother, more subtle animation like Licious
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center justify-center ${
        isSmallScreen ? "py-1" : "py-1.5"
      }`}
    >
      <Reanimated.View
        className={`items-center justify-center`}
        style={animatedStyle}
      >
        {children}
        {/* Licious-style active indicator dot */}
        {focused && (
          <View className="absolute -bottom-1 w-1 h-1 rounded-full bg-red-500" />
        )}
      </Reanimated.View>
    </Pressable>
  );
};

// The main App routing logic inside RecoilRoot
function RootNavigator() {
  const [authState, setAuthState] = useRecoilState(authAtom);
  const [initializing, setInitializing] = useState(true);
  const [authRefreshing, setAuthRefreshing] = useState(false);
  const refreshInFlight = useRef(false);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth(), (user) => {
      if (!user) {
        // User is signed out in Firebase
        if (authState.isAuthenticated) {
          setAuthState({ isAuthenticated: false, token: null, refreshToken: null });
        }
      }
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, [authState.isAuthenticated, initializing, setAuthState]);

  useEffect(() => {
    if (authState?.isAuthenticated) {
      if (!authState.refreshToken) {
        Toast.show({
          type: "error",
          text1: "Session updated",
          text2: "Please log in again to continue.",
        });
        setAuthState({ isAuthenticated: false, token: null, refreshToken: null });
        AsyncStorage.removeItem("auth");
        return;
      }
      setAuthTokens({
        token: authState.token,
        refreshToken: authState.refreshToken,
      });
    } else {
      setAuthTokens({});
    }
  }, [authState?.isAuthenticated, authState?.token, authState?.refreshToken]);

  useEffect(() => {
    setAuthFailureHandler(() => {
      Toast.show({
        type: "error",
        text1: "Session expired",
        text2: "Please log in again.",
      });
      setAuthState({ isAuthenticated: false, token: null, refreshToken: null });
      AsyncStorage.removeItem("auth");
    });
    setAuthUpdateHandler(({ token, refreshToken }) => {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        token,
        refreshToken,
      }));
    });
  }, [setAuthState]);

  useEffect(() => {
    let isMounted = true;
    const bootstrapRefresh = async () => {
      if (!authState?.isAuthenticated || !authState.refreshToken) return;
      try {
        const data = await refreshAccessToken(authState.refreshToken);
        if (!isMounted) return;
        const nextAccessToken = data?.accessToken || data?.jwtToken || null;
        const nextRefreshToken = data?.refreshToken || authState.refreshToken;
        if (!nextAccessToken) {
          throw new Error("Missing access token");
        }
        setAuthTokens({ token: nextAccessToken, refreshToken: nextRefreshToken });
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          token: nextAccessToken,
          refreshToken: nextRefreshToken,
        }));
      } catch (_error) {
        if (!isMounted) return;
        Toast.show({
          type: "error",
          text1: "Session expired",
          text2: "Please log in again.",
        });
        setAuthState({ isAuthenticated: false, token: null, refreshToken: null });
        AsyncStorage.removeItem("auth");
      }
    };
    bootstrapRefresh();
    return () => {
      isMounted = false;
    };
  }, [authState?.isAuthenticated, authState?.refreshToken, setAuthState]);

  const runAuthRefresh = async () => {
    if (!authState?.isAuthenticated || !authState.refreshToken) return;
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setAuthRefreshing(true);
    try {
      const refreshPromise = (async () => {
        const data = await refreshAccessToken(authState.refreshToken);
        return data;
      })();
      setAuthRefreshPromise(refreshPromise);
      // Avoid sending stale access token while refreshing
      setAuthTokens({ token: null, refreshToken: authState.refreshToken });
      const data = await refreshPromise;
      const nextAccessToken = data?.accessToken || data?.jwtToken || null;
      const nextRefreshToken = data?.refreshToken || authState.refreshToken;
      if (!nextAccessToken) {
        throw new Error("Missing access token");
      }
      setAuthTokens({ token: nextAccessToken, refreshToken: nextRefreshToken });
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        token: nextAccessToken,
        refreshToken: nextRefreshToken,
      }));
    } catch (_error) {
      Toast.show({
        type: "error",
        text1: "Session expired",
        text2: "Please log in again.",
      });
      setAuthState({ isAuthenticated: false, token: null, refreshToken: null });
      AsyncStorage.removeItem("auth");
      setAuthTokens({});
    } finally {
      setAuthRefreshPromise(null);
      refreshInFlight.current = false;
      setAuthRefreshing(false);
    }
  };

  useEffect(() => {
    runAuthRefresh();
  }, [authState?.isAuthenticated, authState?.refreshToken]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        runAuthRefresh();
      }
    });
    return () => subscription.remove();
  }, [authState?.isAuthenticated, authState?.refreshToken]);

  if (initializing || authRefreshing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#1F2B24" />
      </View>
    );
  }

  // Gatekeeping: If not authenticated, render the premium Auth flow
  if (!authState.isAuthenticated) {
    return <AuthScreen />;
  }

  // Main Authenticated App Flow
  return (
    <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "white",
            height: isSmallScreen ? 50 : 54, // Adjusted height for labels and icons
            borderTopWidth: 1,
            borderTopColor: "#f1f1f1",
            paddingBottom: isSmallScreen ? 4 : 6,
            paddingTop: 6,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            elevation: 0, // Removing default shadow
            shadowOpacity: 0, // Removing iOS shadow
          },
          tabBarActiveTintColor: "#d11243", // Restored Red active color
          tabBarInactiveTintColor: "#666666",
          tabBarShowLabel: true,
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarSafeAreaInset: { bottom: 0 },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Icon
                type="material-community"
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                className={`text-[10px] mt-0.5 font-bold ${
                  focused ? "text-[#d11243]" : "text-gray-500"
                }`}
              >
                Home
              </Text>
            ),
          }}
        />
        <Tab.Screen
          name="Products"
          component={ProductsScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Icon
                type="material-community"
                name={focused ? "food-drumstick" : "food-drumstick-outline"}
                size={22}
                color={color}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                className={`text-[10px] mt-0.5 font-bold ${
                  focused ? "text-[#d11243]" : "text-gray-500"
                }`}
              >
                Products
              </Text>
            ),
          }}
        />
        <Tab.Screen
          name="Account"
          component={AccountScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Icon
                type="material-community"
                name={focused ? "account" : "account-outline"}
                size={22}
                color={color}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                className={`text-[10px] mt-0.5 font-bold ${
                  focused ? "text-[#d11243]" : "text-gray-500"
                }`}
              >
                Account
              </Text>
            ),
          }}
        />
        <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View className="relative">
                <Icon
                  type="material-community"
                  name={focused ? "cart" : "cart-outline"}
                  size={22}
                  color={color}
                />
                {/* Cart badge */}
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                className={`text-[10px] mt-0.5 font-bold ${
                  focused ? "text-[#d11243]" : "text-gray-500"
                }`}
              >
                Cart
              </Text>
            ),
          }}
        />
      </Tab.Navigator>
  ) 
}

export default function Index() {
  return (
    <>
      <RecoilRoot>
        <RootNavigator />
      </RecoilRoot>
      <Toast />
    </>
  );
}

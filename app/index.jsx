import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View, ActivityIndicator } from "react-native";
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
  setAuthFailureHandler,
  setAuthTokens,
  setAuthUpdateHandler,
} from "../services/http/apiClient";
import CartSyncManager from "../providers/CartSyncManager";

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

  const initRef = useRef(true);

  useEffect(() => {
    console.log("[Root] State - initializing:", initializing, "isHydrated:", authState?.isHydrated, "isAuthenticated:", authState?.isAuthenticated);
  }, [initializing, authState?.isHydrated, authState?.isAuthenticated]);

  // Listen for Firebase Auth state changes — subscribe ONCE
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth(), (user) => {
      console.log("[Root] Firebase onAuthStateChanged - User:", user ? user.email || user.phoneNumber : "null");
      if (!user) {
        // User is signed out in Firebase
        setAuthState((prev) => {
          if (prev.isAuthenticated) {
            return { ...prev, isAuthenticated: false, token: null, refreshToken: null };
          }
          return prev;
        });
      }
      if (initRef.current) {
        initRef.current = false;
        setInitializing(false);
      }
    });
    return subscriber; // unsubscribe on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authState?.isAuthenticated) {
      if (!authState.refreshToken) {
        Toast.show({
          type: "error",
          text1: "Session updated",
          text2: "Please log in again to continue.",
        });
        setAuthState({ isAuthenticated: false, token: null, refreshToken: null, isHydrated: true });
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
      setAuthState({ isAuthenticated: false, token: null, refreshToken: null, isHydrated: true });
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

  if (initializing || !authState.isHydrated) {
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
    <>
    <CartSyncManager />
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
    </>
  );
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

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, Text, View, ActivityIndicator } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { RecoilRoot, useRecoilState } from "recoil";
import { authAtom } from "../recoil/atoms/authAtom";
import { cartState } from "../recoil/atoms/cartAtom";
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
import { mergeCart, replaceCart } from "../services/bff/cartBff";

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
  const [cart, setCart] = useRecoilState(cartState);
  const [initializing, setInitializing] = useState(true);
  const cartSyncRef = React.useRef({
    merged: false,
    syncing: false,
    lastPayload: null,
    debounceId: null,
  });

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
    if (!authState?.isAuthenticated) {
      cartSyncRef.current.merged = false;
      return;
    }
    if (cartSyncRef.current.merged || cartSyncRef.current.syncing) return;

    const runMerge = async () => {
      try {
        cartSyncRef.current.syncing = true;
        const merged = await mergeCart(cart?.items || []);
        if (merged?.items) {
          setCart((current) => ({
            ...current,
            items: merged.items.map((item) => {
              let parsedCustomizations = null;
              if (item.customizations) {
                try {
                  parsedCustomizations = JSON.parse(item.customizations);
                } catch (_error) {
                  parsedCustomizations = null;
                }
              }
              const unitPrice = Number(item.unitPrice || 0);
              const quantity = item.quantity || 1;
              const totalPrice = Number(item.totalPrice || unitPrice * quantity || 0);

              return {
                productId: item.clientProductId || item.productId,
                id: item.productId,
                name: item.productName,
                image_url: item.imageUrl,
                base_price: unitPrice,
                customizations: parsedCustomizations,
                quantity,
                custQuantity: quantity,
                itemPrice: unitPrice,
                totalPrice,
                custPrice: totalPrice,
              };
            }),
          }));
        }
        cartSyncRef.current.merged = true;
      } catch (_error) {
        // Ignore merge failures; local cart still usable.
      } finally {
        cartSyncRef.current.syncing = false;
      }
    };

    runMerge();
  }, [authState?.isAuthenticated, cart?.items, setCart]);

  useEffect(() => {
    if (!authState?.isAuthenticated) {
      return;
    }
    if (cartSyncRef.current.syncing) {
      return;
    }

    const payload = JSON.stringify(
      (cart?.items || []).map((item) => ({
        productId: item.id || item.productId,
        clientProductId: item.productId || item.id,
        quantity: item.quantity,
        customizations: item.customizations || null,
        itemPrice: item.itemPrice || item.base_price || 0,
        totalPrice: item.totalPrice || 0,
        name: item.name || "",
        imageUrl: item.image_url || item.imageUrl || "",
      }))
    );

    if (payload === cartSyncRef.current.lastPayload) {
      return;
    }

    if (cartSyncRef.current.debounceId) {
      clearTimeout(cartSyncRef.current.debounceId);
    }

    cartSyncRef.current.debounceId = setTimeout(async () => {
      try {
        cartSyncRef.current.syncing = true;
        await replaceCart(cart?.items || []);
        cartSyncRef.current.lastPayload = payload;
      } catch (_error) {
        // ignore sync failure
      } finally {
        cartSyncRef.current.syncing = false;
      }
    }, 800);
  }, [authState?.isAuthenticated, cart?.items]);

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

  if (initializing) {
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

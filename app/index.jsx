import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, TextInput, View, ActivityIndicator, Platform } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
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
import CartSyncManager from "../providers/CartSyncManager";
import { Home, CircleUserRound, ShoppingCart } from "lucide-react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";

// Material icon wrappers for filled, dark style
const LICIOUS_RED = "#E41D2D";
const BASE_FONT = "Poppins_500Medium";

const HomeIcon = ({ size, color }) => <Home size={size} color={color} strokeWidth={2.2} />;
const DrumstickIcon = ({ size, color }) => (
  <Icon type="material-community" name="food-drumstick" size={size} color={color} />
);
const AccountIcon = ({ size, color }) => (
  <CircleUserRound size={size} color={color} strokeWidth={2.2} />
);
const CartIcon = ({ size, color }) => (
  <ShoppingCart size={size} color={color} strokeWidth={2.2} />
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

// ── Premium Custom Tab Bar ──
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
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        paddingTop: 6,
        paddingBottom: Platform.OS === "ios" ? (isSmallScreen ? 10 : 18) : 6,
        paddingHorizontal: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const IconComponent = TAB_ICONS[route.name];

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
              badge={route.name === "Cart" && itemCount > 0 ? itemCount : 0}
            />
          );
        })}
      </View>
    </View>
  );
};

const TabItem = ({ focused, label, IconComponent, onPress, badge = 0 }) => {
  const pillWidth = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    pillWidth.value = withSpring(focused ? 1 : 0, { damping: 16, stiffness: 140 });
  }, [focused]);

  const pillAnimStyle = useAnimatedStyle(() => ({
    paddingHorizontal: 10 + pillWidth.value * 6,
    backgroundColor: `rgba(209, 18, 67, ${pillWidth.value * 0.06})`,
  }));

  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Reanimated.View
        style={[
          {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            borderRadius: 20,
          },
          pillAnimStyle,
        ]}
      >
        {/* Icon */}
        <View style={{ position: "relative" }}>
          <IconComponent
            size={20}
            color={focused ? LICIOUS_RED : "#333333"}
          />
          {badge > 0 && (
            <View
              style={{
                position: "absolute",
                top: -5,
                right: -9,
                backgroundColor: LICIOUS_RED,
                borderRadius: 7,
                minWidth: 15,
                height: 15,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 3,
                borderWidth: 1.5,
                borderColor: "white",
              }}
            >
              <Text style={{ color: "white", fontSize: 8, fontWeight: "900" }}>
                {badge > 9 ? "9+" : badge}
              </Text>
            </View>
          )}
        </View>

        <Text
          numberOfLines={1}
          style={{
            marginTop: 4,
            fontSize: 11,
            fontWeight: focused ? "800" : "600",
            color: focused ? LICIOUS_RED : "#333333",
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
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

export default function Index() {
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
      color: "#111827",
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
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <>
      <RecoilRoot>
        <RootNavigator />
      </RecoilRoot>
      <Toast />
    </>
  );
}

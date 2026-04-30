import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import Reanimated, { FadeInDown } from "react-native-reanimated";
import {
  Users,
  Tag,
  Bell,
  Store,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  FileText,
} from "lucide-react-native";
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import { authAtom } from "../../recoil/atoms/authAtom";
import { cartState } from "../../recoil/atoms/cartAtom";
import { notificationAtom } from "../../recoil/atoms/notificationAtom";
import authFirebase from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutSession, unregisterCurrentDevice } from "../../services/bff/accountBff";
import { useIsFocused } from "@react-navigation/native";

import AdminUsers from "./AdminUsers";
import AdminCoupons from "./AdminCoupons";
import AdminBroadcast from "./AdminBroadcast";
import AdminShopSettings from "./AdminShopSettings";
import AccountHub from "../Account/AccountHub";

const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0;

const SECTIONS = [
  {
    title: "MANAGEMENT",
    items: [
      { key: "users", label: "Users", subtitle: "View all customers", icon: Users, color: "#1565C0", bg: "#E3F2FD" },
      { key: "coupons", label: "Coupons", subtitle: "Manage offers & discounts", icon: Tag, color: "#DB2777", bg: "#FDF2F8" },
      { key: "broadcast", label: "Broadcast", subtitle: "Push notifications", icon: Bell, color: "#C62828", bg: "#FFEBEE" },
      { key: "shop", label: "Shop Settings", subtitle: "Hours, delivery & config", icon: Store, color: "#6A1B9A", bg: "#F3E5F5" },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { key: "account", label: "Account Settings", subtitle: "Profile, addresses, orders", icon: Settings, color: "#3C3C43", bg: "#F2F2F7" },
      { key: "audit", label: "Audit Log", subtitle: "Admin activity history", icon: FileText, color: "#4527A0", bg: "#EDE7F6" },
    ],
  },
];

const AdminMoreScreen = () => {
  const [section, setSection] = useState("home");
  const profile = useRecoilValue(profileAtom);
  const setAuthState = useSetRecoilState(authAtom);
  const resetCart = useResetRecoilState(cartState);
  const resetNotifications = useResetRecoilState(notificationAtom);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Reset to hub when tab regains focus (prevents stale sub-screen)
  const isFocused = useIsFocused();
  const wasUnfocused = useRef(false);

  useEffect(() => {
    if (!isFocused) {
      wasUnfocused.current = true;
    } else if (wasUnfocused.current) {
      wasUnfocused.current = false;
      setSection("home");
    }
  }, [isFocused]);

  // Sub-navigation
  if (section === "users") return <AdminUsers onBack={() => setSection("home")} />;
  if (section === "coupons") return <AdminCoupons onBack={() => setSection("home")} />;
  if (section === "broadcast") return <AdminBroadcast onBack={() => setSection("home")} />;
  if (section === "shop") return <AdminShopSettings onBack={() => setSection("home")} />;
  if (section === "account") return <AccountHub onBack={() => setSection("home")} />;
  // audit log would go here

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await unregisterCurrentDevice();
            await logoutSession();
            await authFirebase().signOut();
          } catch (_e) {
            /* ignore */
          }
          setAuthState({
            isAuthenticated: false,
            isHydrated: true,
          });
          resetCart();
          resetNotifications();
          await AsyncStorage.multiRemove(["auth", "profile", "cart"]);
          setIsLoggingOut(false);
        },
      },
    ]);
  };

  const firstName = profile.firstName || "Admin";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F8F8FC" }}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingTop: STATUSBAR_HEIGHT + 8, paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 13, color: "#8E8E93" }}>Welcome back,</Text>
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#1C1C1E", marginTop: 2 }}>
              {firstName} 👋
            </Text>
          </View>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: "#2C2C2E",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={20} color="#FFFFFF" strokeWidth={2} />
          </View>
        </View>
      </View>

      {/* Sections */}
      {SECTIONS.map((group, gi) => (
        <View key={group.title}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#8E8E93",
              paddingHorizontal: 20,
              marginTop: gi === 0 ? 4 : 20,
              marginBottom: 10,
              letterSpacing: 0.8,
            }}
          >
            {group.title}
          </Text>
          <View style={{ paddingHorizontal: 16 }}>
            {group.items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reanimated.View
                  key={item.key}
                  entering={FadeInDown.delay((gi * group.items.length + idx) * 50).duration(280)}
                >
                  <TouchableOpacity
                    onPress={() => setSection(item.key)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#FFFFFF",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 8,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.03,
                      shadowRadius: 4,
                      elevation: 1,
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        backgroundColor: item.bg,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                      }}
                    >
                      <Icon size={20} color={item.color} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: "#1C1C1E" }}>
                        {item.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 1 }}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#C7C7CC" strokeWidth={2} />
                  </TouchableOpacity>
                </Reanimated.View>
              );
            })}
          </View>
        </View>
      ))}

      {/* Logout */}
      <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            paddingVertical: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.03,
            shadowRadius: 4,
            elevation: 1,
          }}
          activeOpacity={0.7}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#C62828" />
          ) : (
            <>
              <LogOut size={16} color="#C62828" strokeWidth={2.5} />
              <Text style={{ color: "#C62828", fontSize: 14, fontWeight: "700", marginLeft: 8 }}>
                Logout
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Version */}
      <Text
        style={{
          fontSize: 11,
          color: "#C7C7CC",
          textAlign: "center",
          marginTop: 20,
        }}
      >
        NG FreshFoods Admin v1.0
      </Text>
    </ScrollView>
  );
};

export default AdminMoreScreen;

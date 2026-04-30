import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Bell,
  Store,
  Tag,
  ArrowLeft,
  User,
  LogOut,
  Settings,
} from "lucide-react-native";
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import { authAtom } from "../../recoil/atoms/authAtom";
import { cartState } from "../../recoil/atoms/cartAtom";
import { notificationAtom } from "../../recoil/atoms/notificationAtom";
import authFirebase from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutSession, unregisterCurrentDevice } from "../../services/bff/accountBff";
import AdminDashboard from "./AdminDashboard";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminBroadcast from "./AdminBroadcast";
import AdminShopSettings from "./AdminShopSettings";
import AdminCoupons from "./AdminCoupons";
import AccountHub from "../Account/AccountHub";

const ADMIN_SECTIONS = [
  { key: "dashboard", title: "Dashboard", subtitle: "Overview & stats", icon: LayoutDashboard, color: "#6366F1", bg: "#EEF2FF" },
  { key: "orders", title: "Orders", subtitle: "Manage all orders", icon: ShoppingBag, color: "#F59E0B", bg: "#FFFBEB" },
  { key: "products", title: "Products", subtitle: "Stock & catalog", icon: Package, color: "#10B981", bg: "#ECFDF5" },
  { key: "users", title: "Users", subtitle: "Customer list", icon: Users, color: "#3B82F6", bg: "#EFF6FF" },
  { key: "coupons", title: "Coupons", subtitle: "Offers & discounts", icon: Tag, color: "#EC4899", bg: "#FDF2F8" },
  { key: "broadcast", title: "Broadcast", subtitle: "Push to users", icon: Bell, color: "#EF4444", bg: "#FEF2F2" },
  { key: "shop", title: "Shop Settings", subtitle: "Open/close & timings", icon: Store, color: "#8B5CF6", bg: "#F5F3FF" },
];

const AdminPanel = ({ onBack }) => {
  const [section, setSection] = useState("home");
  const profile = useRecoilValue(profileAtom);
  const setAuthState = useSetRecoilState(authAtom);
  const resetCart = useResetRecoilState(cartState);
  const resetNotifications = useResetRecoilState(notificationAtom);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sub-section routing
  if (section === "dashboard") return <AdminDashboard onBack={() => setSection("home")} />;
  if (section === "orders") return <AdminOrders onBack={() => setSection("home")} />;
  if (section === "products") return <AdminProducts onBack={() => setSection("home")} />;
  if (section === "users") return <AdminUsers onBack={() => setSection("home")} />;
  if (section === "coupons") return <AdminCoupons onBack={() => setSection("home")} />;
  if (section === "broadcast") return <AdminBroadcast onBack={() => setSection("home")} />;
  if (section === "shop") return <AdminShopSettings onBack={() => setSection("home")} />;
  if (section === "account") return <AccountHub onBack={() => setSection("home")} />;

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
          } catch (_e) { /* ignore */ }
          setAuthState({ isAuthenticated: false, isHydrated: true });
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
    <ScrollView className="flex-1 bg-[#F5F5FA]" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View className="px-5 pt-5 pb-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[13px] text-[#93959F]">Welcome back,</Text>
            <Text className="text-[24px] font-bold text-[#1C1C1C]">{firstName} 👋</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-[#1E1E2E] items-center justify-center"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
            <Text className="text-white font-bold text-[15px]">{firstName.charAt(0)}</Text>
          </View>
        </View>
      </View>

      {/* Admin Grid */}
      <View className="flex-row flex-wrap px-4 mt-4" style={{ justifyContent: "space-between" }}>
        {ADMIN_SECTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setSection(item.key)}
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                width: "48.5%",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
              activeOpacity={0.85}
            >
              <View
                className="w-11 h-11 rounded-xl items-center justify-center mb-3"
                style={{ backgroundColor: item.bg }}
              >
                <Icon size={22} color={item.color} strokeWidth={2} />
              </View>
              <Text className="text-[15px] font-semibold text-[#1C1C1C]">{item.title}</Text>
              <Text className="text-[12px] text-[#93959F] mt-0.5">{item.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Account & Logout */}
      <View className="px-4 mt-1">
        <TouchableOpacity
          onPress={() => setSection("account")}
          className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 mb-3"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
          activeOpacity={0.85}
        >
          <View className="w-9 h-9 rounded-xl bg-[#F3F4F6] items-center justify-center mr-3">
            <Settings size={18} color="#5C5F6A" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-semibold text-[#1C1C1C]">Account Settings</Text>
            <Text className="text-[11px] text-[#93959F]">Profile, addresses, orders</Text>
          </View>
          <ArrowLeft size={16} color="#C4C4C4" strokeWidth={2} style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          className="flex-row items-center justify-center bg-white rounded-2xl py-3.5"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
          activeOpacity={0.85}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <>
              <LogOut size={16} color="#DC2626" strokeWidth={2.5} />
              <Text className="text-[14px] font-bold text-red-600 ml-2">Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AdminPanel;

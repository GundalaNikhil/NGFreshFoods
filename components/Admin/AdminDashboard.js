import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  FadeIn,
  FadeInDown,
  Layout,
} from "react-native-reanimated";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  Package,
  Store,
  ChevronRight,
  Clock,
  RefreshCw,
} from "lucide-react-native";
import { useRecoilValue } from "recoil";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import { fetchDashboard, fetchAllOrders } from "../../services/bff/adminBff";
import { DashboardSkeleton } from "./shared/SkeletonLoader";
import { useQuery } from "@tanstack/react-query";

const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0;

// ── Animated Stat Card ──
const StatCard = ({ title, value, icon: Icon, color, bg, index = 0 }) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 80;
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 14, stiffness: 120 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Reanimated.View
      style={[
        {
          width: "48%",
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 16,
          marginBottom: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon size={20} color={color} strokeWidth={2} />
      </View>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          color: "#1C1C1E",
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 2, fontWeight: "500" }}>
        {title}
      </Text>
    </Reanimated.View>
  );
};

// ── Recent Order Row ──
const STATUS_COLORS = {
  PENDING: { bg: "#FFF3E0", text: "#E65100" },
  CONFIRMED: { bg: "#E3F2FD", text: "#1565C0" },
  PREPARING: { bg: "#EDE7F6", text: "#4527A0" },
  OUT_FOR_DELIVERY: { bg: "#FFF8E1", text: "#F57F17" },
  DELIVERED: { bg: "#E8F5E9", text: "#2E7D32" },
  CANCELLED: { bg: "#FFEBEE", text: "#C62828" },
};

const RecentOrderRow = ({ order, index, onPress }) => (
  <Reanimated.View
    entering={FadeInDown.delay(300 + index * 60).duration(350)}
  >
    <TouchableOpacity
      onPress={() => onPress?.(order)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
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
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: (STATUS_COLORS[order.orderStatus] || STATUS_COLORS.PENDING).bg,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <ShoppingBag
          size={16}
          color={(STATUS_COLORS[order.orderStatus] || STATUS_COLORS.PENDING).text}
          strokeWidth={2}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#1C1C1E" }}>
          #{order.orderNumber}
        </Text>
        <Text style={{ fontSize: 11, color: "#8E8E93", marginTop: 1 }}>
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#1C1C1E" }}>
          ₹{order.totalAmount?.toLocaleString("en-IN")}
        </Text>
        <View
          style={{
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginTop: 3,
            backgroundColor: (STATUS_COLORS[order.orderStatus] || STATUS_COLORS.PENDING).bg,
          }}
        >
          <Text
            style={{
              fontSize: 9,
              fontWeight: "700",
              color: (STATUS_COLORS[order.orderStatus] || STATUS_COLORS.PENDING).text,
              letterSpacing: 0.3,
            }}
          >
            {order.orderStatus?.replace(/_/g, " ")}
          </Text>
        </View>
      </View>
      <ChevronRight size={14} color="#C7C7CC" strokeWidth={2} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  </Reanimated.View>
);

// ── Main Dashboard ──
const AdminDashboard = ({ onNavigateToOrders }) => {
  const profile = useRecoilValue(profileAtom);

  const {
    data: dashData,
    isLoading: dashLoading,
    refetch: refetchDash,
    isRefetching: isRefetchingDash,
  } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: fetchDashboard,
  });

  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["adminOrders", "ALL"],
    queryFn: () => fetchAllOrders(null),
  });

  const loading = dashLoading || ordersLoading;
  const data = dashData;
  const recentOrders = Array.isArray(ordersData) ? ordersData.slice(0, 5) : [];

  const onRefresh = () => {
    refetchDash();
    refetchOrders();
  };

  const firstName = profile.firstName || "Admin";

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8F8FC" }}>
        <View style={{ paddingTop: STATUSBAR_HEIGHT + 8, paddingHorizontal: 20, paddingBottom: 8 }}>
          <Text style={{ fontSize: 13, color: "#8E8E93" }}>Welcome back,</Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#1C1C1E", marginTop: 2 }}>
            {firstName} 👋
          </Text>
        </View>
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F8F8FC" }}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={isRefetchingDash} onRefresh={onRefresh} tintColor="#3C3C43" />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting Header */}
      <View style={{ paddingTop: STATUSBAR_HEIGHT + 8, paddingHorizontal: 20, paddingBottom: 4 }}>
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
            <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "700" }}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {data ? (
        <>
          {/* Top Banner (Enterprise Style) */}
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <Reanimated.View 
              entering={FadeInDown.duration(400)}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 24,
                borderWidth: 1,
                borderColor: "#EEEFF3",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ color: "#8E8E93", fontSize: 13, fontWeight: "600", letterSpacing: 0.5 }}>TODAY'S REVENUE</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4 }}>
                <Text style={{ color: "#1C1C1E", fontSize: 36, fontWeight: "800", letterSpacing: -1 }}>
                  ₹{(data.todayRevenue || 0).toLocaleString("en-IN")}
                </Text>
              </View>
              
              <View style={{ height: 1, backgroundColor: "#EEEFF3", marginVertical: 20 }} />
              
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ color: "#8E8E93", fontSize: 12, fontWeight: "500" }}>Orders Today</Text>
                  <Text style={{ color: "#1C1C1E", fontSize: 20, fontWeight: "700", marginTop: 4 }}>{data.todayOrders || 0}</Text>
                </View>
                <View>
                  <Text style={{ color: "#8E8E93", fontSize: 12, fontWeight: "500" }}>Pending</Text>
                  <Text style={{ color: "#1C1C1E", fontSize: 20, fontWeight: "700", marginTop: 4 }}>{data.pendingOrders || 0}</Text>
                </View>
                <View>
                  <Text style={{ color: "#8E8E93", fontSize: 12, fontWeight: "500" }}>Out of Stock</Text>
                  <Text style={{ color: "#C62828", fontSize: 20, fontWeight: "700", marginTop: 4 }}>{data.outOfStockProducts || 0}</Text>
                </View>
              </View>
            </Reanimated.View>
          </View>

          {/* Quick Actions / Overall Stats */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#1C1C1E",
              paddingHorizontal: 20,
              marginTop: 28,
              marginBottom: 14,
            }}
          >
            Business Overview
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              paddingHorizontal: 16,
            }}
          >
            <StatCard
              title="Total Users"
              value={data.totalUsers || 0}
              icon={Users}
              color="#3C3C43"
              bg="#F2F2F7"
              index={0}
            />
            <StatCard
              title="Total Revenue"
              value={`₹${((data.totalRevenue || 0) / 1000).toFixed(1)}k`}
              icon={TrendingUp}
              color="#3C3C43"
              bg="#F2F2F7"
              index={1}
            />
            <StatCard
              title="Total Orders"
              value={data.totalOrders || 0}
              icon={ShoppingBag}
              color="#3C3C43"
              bg="#F2F2F7"
              index={2}
            />
            <StatCard
              title="Active Products"
              value={data.activeProducts || 0}
              icon={Package}
              color="#3C3C43"
              bg="#F2F2F7"
              index={3}
            />
          </View>

          {/* Recent Orders */}
          {recentOrders.length > 0 && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  marginTop: 20,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#8E8E93",
                    letterSpacing: 0.8,
                  }}
                >
                  RECENT ORDERS
                </Text>
                {onNavigateToOrders && (
                  <TouchableOpacity
                    onPress={onNavigateToOrders}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#3C3C43" }}>
                      View All
                    </Text>
                    <ChevronRight size={14} color="#3C3C43" strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ paddingHorizontal: 16 }}>
                {recentOrders.map((order, idx) => (
                  <RecentOrderRow key={order.orderId} order={order} index={idx} />
                ))}
              </View>
            </>
          )}
        </>
      ) : (
        <View style={{ alignItems: "center", paddingTop: 60 }}>
          <RefreshCw size={28} color="#C7C7CC" strokeWidth={1.5} />
          <Text style={{ fontSize: 15, color: "#8E8E93", marginTop: 12 }}>
            Unable to load dashboard
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            style={{
              marginTop: 16,
              backgroundColor: "#2C2C2E",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default AdminDashboard;

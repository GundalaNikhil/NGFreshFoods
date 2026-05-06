/* forced bundler cache bypass */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  InteractionManager,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gift,
  LogOut,
  MapPin,
  Receipt,
  Settings,
  User,
  LifeBuoy,
  Leaf,
} from "lucide-react-native";
import authFirebase from "@react-native-firebase/auth";
import { authAtom } from "../../recoil/atoms/authAtom";
import { notificationAtom } from "../../recoil/atoms/notificationAtom";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import {
  fetchNotificationFeed,
  fetchNotificationPreferences,
  fetchMyOrders,
  fetchMyProfile,
  logoutSession,
  unregisterCurrentDevice,
  updateNotificationPreferences,
  updateMyProfile,
} from "../../services/bff/accountBff";
import { clearCachedData, getCachedData, setCachedData } from "../../utils/localCache";
import OrderDetailScreen from "../Cart/OrderDetailScreen";
import AddAddressModal from "../Home/AddAddressModal";
import { useAddress } from "../../hooks/useAddress";
import AboutPage from "../About/AboutPage";

const ACCOUNT_CACHE_TTL_MS = 2 * 60 * 1000;

const SectionButton = ({ title, subtitle, icon: IconCmp, iconColor = "#E23744", iconBg = "#FFF0F1", onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-4 mb-3"
    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
    activeOpacity={0.85}
  >
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: iconBg }}>
        <IconCmp size={20} color={iconColor} />
      </View>
      <View className="ml-3">
        <Text className="text-[15px] font-semibold text-[#1C1C1C]">{title}</Text>
        {subtitle ? (
          <Text className="text-[12px] text-[#686B78] mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
    </View>
    <ChevronRight size={18} color="#94A3B8" />
  </TouchableOpacity>
);

const SectionHeader = ({ title, onBack }) => (
  <View className="flex-row items-center mb-4">
    <TouchableOpacity onPress={onBack} className="mr-3 p-2 rounded-full bg-white">
      <ChevronLeft size={18} color="#1F2937" />
    </TouchableOpacity>
    <Text className="text-lg font-bold text-[#1C1C1C]">{title}</Text>
  </View>
);

const EmptyState = ({ title, subtitle, actionLabel, onAction, image }) => (
  <View className="bg-white rounded-2xl p-6 items-center" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
    {image ? (
      <Image 
        source={image} 
        style={{ width: 140, height: 140, marginBottom: 16 }} 
        resizeMode="contain"
      />
    ) : null}
    <Text className="text-base font-semibold text-[#1C1C1C] mb-1">{title}</Text>
    {subtitle ? (
      <Text className="text-[12px] text-[#686B78] text-center">{subtitle}</Text>
    ) : null}
    {actionLabel ? (
      <TouchableOpacity
        onPress={onAction}
        className="mt-4 px-4 py-2 rounded-full bg-[#E23744]"
        activeOpacity={0.85}
      >
        <Text className="text-white text-[12px] font-semibold">{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const OrderCard = ({ order, onPress }) => {
  const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
  const orderLabel = order?.orderNumber || order?.orderId || "Order";
  const orderIdShort =
    orderLabel && orderLabel.length > 10 ? orderLabel.slice(0, 10) : orderLabel;
  const paymentStatus = String(order?.payment?.paymentStatus || "").toUpperCase();
  const isOnlinePaymentPending =
    order?.orderStatus === "PENDING" &&
    paymentStatus &&
    paymentStatus !== "SUCCESS" &&
    paymentStatus !== "REFUNDED";

  // Status color coding
  const statusConfig = (() => {
    if (isOnlinePaymentPending) {
      return { bg: "bg-amber-50", text: "text-amber-700", label: "Payment Pending" };
    }
    switch (order?.orderStatus) {
      case "CONFIRMED":
      case "PREPARING":
      case "OUT_FOR_DELIVERY":
        return { bg: "bg-green-50", text: "text-green-700", label: order.orderStatus.replace(/_/g, " ") };
      case "DELIVERED":
        return { bg: "bg-blue-50", text: "text-blue-700", label: "Delivered" };
      case "CANCELLED":
        return { bg: "bg-red-50", text: "text-red-600", label: "Cancelled" };
      default: // PENDING
        return { bg: "bg-amber-50", text: "text-amber-700", label: "Awaiting Confirmation" };
    }
  })();

  // Items preview
  const itemNames = (order?.orderItems || [])
    .slice(0, 2)
    .map((i) => i.orderName || "Item")
    .join(", ");
  const extraCount = (order?.orderItems?.length || 0) - 2;
  const itemsPreview = itemNames + (extraCount > 0 ? ` +${extraCount} more` : "");

  // Payment method
  const paymentMethod = order?.payment?.paymentMethod || order?.payment?.transactionType || null;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
      activeOpacity={0.85}
      onPress={() => onPress && onPress(order)}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-[#1C1C1C]">
          {orderIdShort}
        </Text>
        <View className={`px-3 py-1 rounded-full ${statusConfig.bg}`}>
          <Text className={`text-[11px] font-semibold ${statusConfig.text}`}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Items preview */}
      {itemsPreview ? (
        <Text className="text-[12px] text-gray-600 mt-2" numberOfLines={1}>
          {itemsPreview}
        </Text>
      ) : null}

      <Text className="text-[12px] text-[#93959F] mt-1">
        {createdAt ? createdAt.toDateString() : "Order date unavailable"}
      </Text>

      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-50">
        <View className="flex-row items-center">
          {paymentMethod ? (
            <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-full mr-2">
              <CreditCard size={12} color="#6B7280" strokeWidth={2} />
              <Text className="text-[10px] text-[#686B78] font-semibold ml-1">
                {paymentMethod}
              </Text>
            </View>
          ) : null}
          <Text className="text-[12px] text-[#686B78]">
            {order?.orderItems?.length || 0} items
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-[14px] font-bold text-[#1C1C1C] mr-1">
            ₹{Number(order?.totalAmount || 0).toFixed(2)}
          </Text>
          <ChevronRight size={14} color="#9CA3AF" strokeWidth={2} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const NotificationCard = ({ item, onPress }) => (
  <TouchableOpacity
    className="bg-white rounded-2xl p-4 mb-3"
    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
    activeOpacity={0.85}
    onPress={() => onPress && onPress(item)}
  >
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-[14px] font-semibold text-[#1C1C1C]">{item.title}</Text>
        <Text className="text-[12px] text-gray-600 mt-1 leading-5">{item.body}</Text>
      </View>
      <View className="px-2 py-1 rounded-full bg-[#FFF0F1]">
        <Text className="text-[10px] font-semibold text-[#E23744]">
          {(item.eventType || "UPDATE").replace(/_/g, " ")}
        </Text>
      </View>
    </View>
    <Text className="text-[11px] text-[#93959F] mt-3">
      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Just now"}
    </Text>
  </TouchableOpacity>
);

const AccountHub = ({ onBack }) => {
  const setAuth = useSetRecoilState(authAtom);
  const resetProfile = useResetRecoilState(profileAtom);
  const [profile, setProfile] = useRecoilState(profileAtom);
  const notificationState = useRecoilValue(notificationAtom);

  const [section, setSection] = useState("home");
  const navigation = useNavigation();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [notificationsError, setNotificationsError] = useState("");
  const [orders, setOrders] = useState([]);
  const [notificationFeed, setNotificationFeed] = useState([]);
  const [notificationPreferences, setNotificationPreferences] = useState(null);
  const { addresses, refreshAddresses, deleteAddress, addAddress } = useAddress();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAddAddressVisible, setIsAddAddressVisible] = useState(false);

  const resetToHome = useCallback(() => {
    setSelectedOrder(null);
    setIsAddAddressVisible(false);
    setSection("home");
  }, []);

  const displayName = useMemo(() => {
    if (profile.fullName?.trim()) return profile.fullName;
    const stitched = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
    return stitched || "Fresh Shopper";
  }, [profile.firstName, profile.lastName, profile.fullName]);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError("");
    const response = await fetchMyProfile();
    if (response.success) {
      setProfile(response.data.profile);
    } else {
      setProfileError(response.error.message || "Failed to load profile.");
    }
    setLoadingProfile(false);
  }, [setProfile]);

  const loadOrders = useCallback(async () => {
    setOrdersError("");
    const cacheKey = `orders:${profile.userId || profile.phoneNumber || "current"}`;
    const cachedOrders = await getCachedData(cacheKey, ACCOUNT_CACHE_TTL_MS);

    if (cachedOrders) {
      setOrders(cachedOrders);
      setLoadingOrders(false);
    } else {
      setLoadingOrders(true);
    }

    const response = await fetchMyOrders();
    if (response.success) {
      const nextOrders = response.data.orders || [];
      setOrders(nextOrders);
      setCachedData(cacheKey, nextOrders);
    } else {
      setOrdersError(response.error.message || "Failed to load orders.");
    }
    setLoadingOrders(false);
  }, [profile.phoneNumber, profile.userId]);

  const loadNotifications = useCallback(async () => {
    setNotificationsError("");
    const cacheKey = `notifications:${profile.userId || profile.phoneNumber || "current"}`;
    const cachedNotifications = await getCachedData(cacheKey, ACCOUNT_CACHE_TTL_MS);

    if (cachedNotifications) {
      setNotificationPreferences(cachedNotifications.preferences || null);
      setNotificationFeed(cachedNotifications.feed || []);
      setLoadingNotifications(false);
    } else {
      setLoadingNotifications(true);
    }

    const [prefsResponse, feedResponse] = await Promise.all([
      fetchNotificationPreferences(),
      fetchNotificationFeed(),
    ]);

    if (!prefsResponse.success) {
      setNotificationsError(
        prefsResponse.error.message || "Failed to load notification preferences."
      );
    }

    if (!feedResponse.success) {
      setNotificationsError(
        feedResponse.error.message || "Failed to load notifications."
      );
    }

    if (prefsResponse.success) {
      setNotificationPreferences(prefsResponse.data || null);
    }

    if (feedResponse.success) {
      setNotificationFeed(feedResponse.data.notifications || []);
    }

    if (prefsResponse.success && feedResponse.success) {
      setCachedData(cacheKey, {
        preferences: prefsResponse.data,
        feed: feedResponse.data.notifications || [],
      });
    }

    setLoadingNotifications(false);
  }, [
    profile.phoneNumber,
    profile.userId,
  ]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadProfile();
    });

    return () => {
      task?.cancel?.();
    };
  }, [loadProfile]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      if (section === "orders") loadOrders();
      if (section === "addresses") refreshAddresses();
      if (section === "notifications") loadNotifications();
    });

    return () => {
      task?.cancel?.();
    };
  }, [loadNotifications, loadOrders, refreshAddresses, section]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", (e) => {
      if (navigation.isFocused()) {
        resetToHome();
      }
    });
    return unsubscribe;
  }, [navigation, resetToHome]);

  useEffect(() => {
    const intent = notificationState.intent;
    if (!intent) {
      return;
    }

    const normalizedTarget = String(
      intent.targetScreen || intent.deepLink || ""
    ).toLowerCase();

    if (
      intent.orderId ||
      normalizedTarget.includes("orders") ||
      normalizedTarget.includes("order")
    ) {
      setSection("orders");
      return;
    }

    if (
      normalizedTarget.includes("notifications") ||
      normalizedTarget.includes("notification")
    ) {
      setSection("notifications");
    }
  }, [notificationState.intent, notificationState.intentUpdatedAt]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await unregisterCurrentDevice();
    } catch (_error) {
      // Device cleanup is best effort.
    }

    try {
      await logoutSession();
    } catch (_error) {
      // Session cleanup is best effort; local logout must still complete.
    }

    try {
      await authFirebase().signOut();
    } catch (error) {
      console.error("Firebase logout error:", error);
    }

    setAuth((prev) => ({
      ...prev,
      isAuthenticated: false,
    }));
    resetProfile();
    clearCachedData(`orders:${profile.userId || profile.phoneNumber || "current"}`);
    clearCachedData(`notifications:${profile.userId || profile.phoneNumber || "current"}`);
    setIsLoggingOut(false);
  };

  const handlePreferenceToggle = async (key, value) => {
    const nextPreferences = {
      ...(notificationPreferences || {}),
      [key]: value,
    };

    setNotificationPreferences(nextPreferences);

    const response = await updateNotificationPreferences({
      payload: nextPreferences,
    });

    if (!response.success) {
      setNotificationsError(
        response.error.message || "Failed to update notification preferences."
      );
      loadNotifications();
      return;
    }

    setNotificationPreferences(response.data || nextPreferences);
  };

  const openNotificationItem = (item) => {
    let payload = {};
    try {
      payload = item.payloadJson ? JSON.parse(item.payloadJson) : {};
    } catch (_error) {
      payload = {};
    }

    if (payload.orderId) {
      setSelectedOrder({ orderId: payload.orderId });
      setSection("orderDetail");
      return;
    }

    const targetScreen = String(
      payload.targetScreen || item.targetScreen || item.deepLink || ""
    ).toLowerCase();

    if (
      targetScreen.includes("notifications") ||
      targetScreen.includes("notification")
    ) {
      setSection("notifications");
      return;
    }

    Alert.alert(item.title || "Notification", item.body || "No additional details.");
  };

  const quickCommerceItems = [
    {
      title: "Your Orders",
      subtitle: "Track & reorder",
      icon: Receipt,
      iconColor: "#5C5F6A",
      iconBg: "#F3F4F6",
      onPress: () => setSection("orders"),
    },
    {
      title: "Profile",
      subtitle: "Name, phone, email",
      icon: User,
      iconColor: "#5C5F6A",
      iconBg: "#F3F4F6",
      onPress: () => setSection("profile"),
    },
    {
      title: "Addresses",
      subtitle: "Add or edit spots",
      icon: MapPin,
      iconColor: "#5C5F6A",
      iconBg: "#F3F4F6",
      onPress: () => setSection("addresses"),
    },
    {
      title: "Payments",
      subtitle: "Cards & UPI",
      icon: CreditCard,
      iconColor: "#5C5F6A",
      iconBg: "#F3F4F6",
      onPress: () => setSection("payments"),
    },
    {
      title: "Notifications",
      subtitle: "Updates & offers",
      icon: Bell,
      iconColor: "#5C5F6A",
      iconBg: "#F3F4F6",
      onPress: () => setSection("notifications"),
    },
    {
      title: "Help",
      subtitle: "Chat with us",
      icon: LifeBuoy,
      iconColor: "#5C5F6A",
      iconBg: "#F3F4F6",
      onPress: () => setSection("support"),
    },
    {
      title: "Refer & Earn",
      subtitle: "Invite for rewards",
      icon: Gift,
      iconColor: "#5C5F6A",
      iconBg: "#F3F4F6",
      onPress: () => setSection("refer"),
    },
    {
      title: "Preferences",
      subtitle: "Taste & delivery",
      icon: Settings,
      iconColor: "#5C5F6A",
      iconBg: "#F3F4F6",
      onPress: () => setSection("preferences"),
    },
    {
      title: "About Us",
      subtitle: "Mission & Founders",
      icon: Leaf,
      iconColor: "#5C5F6A",
      iconBg: "#F3F4F6",
      onPress: () => setSection("about"),
    },
  ];

  // --- Helper: check if email looks real ---
  const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    // Filter out phone-number-based fake emails and empty values  
    if (/^\d{5,}/.test(email)) return false;
    if (!email.includes("@") || !email.includes(".")) return false;
    return true;
  };

  if (section === "orderDetail" && selectedOrder) {
    return (
      <OrderDetailScreen
        orderId={selectedOrder?.orderId}
        order={selectedOrder}
        onBack={() => {
          setSelectedOrder(null);
          setSection("orders");
        }}
      />
    );
  }



  if (section === "orders") {
    return (
      <View className="flex-1">
        <SectionHeader title="Your Orders" onBack={() => setSection("home")} />
        {loadingOrders ? (
          <View className="flex-1 items-center justify-center p-20">
            <ActivityIndicator size="large" color="#E23744" />
            <Text className="text-[#93959F] mt-4 font-medium">Fetching orders...</Text>
          </View>
        ) : ordersError ? (
          <EmptyState
            title="Unable to load your orders"
            subtitle="We hit a small snag while fetching your kitchen history. A quick retry or a fresh start might help!"
            actionLabel="Try again"
            onAction={loadOrders}
            image={require("../../assets/images/characters/orders/empty.png")}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            title="Ready for your first order?"
            subtitle="Your kitchen is waiting for some fresh meat, chicken, and eggs. Place your first order now!"
            actionLabel="Start Shopping"
            onAction={() => setSection("home")}
            image={require("../../assets/images/characters/orders/active.png")}
          />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(order) => order.orderId?.toString() || order.razorPayOrderId}
            initialNumToRender={5}
            windowSize={5}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={30}
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item: order }) => (
              <OrderCard
                order={order}
                onPress={(o) => {
                  setSelectedOrder(o);
                  setSection("orderDetail");
                }}
              />
            )}
          />
        )}
      </View>
    );
  }

  if (section === "profile") {
    return (
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        <SectionHeader title="Profile" onBack={() => setSection("home")} />
        <ProfileEditor
          profile={profile}
          loading={loadingProfile}
          error={profileError}
          onReload={loadProfile}
          onSave={async (payload) => {
            setLoadingProfile(true);
            setProfileError("");
            const response = await updateMyProfile({
              ...payload,
            });
            if (response.success) {
              setProfile(response.data.profile);
            } else {
              setProfileError(response.error.message || "Failed to update profile.");
            }
            setLoadingProfile(false);
          }}
        />
      </ScrollView>
    );
  }

  if (section === "addresses") {
    return (
      <View className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          <SectionHeader
            title="Saved Addresses"
            onBack={() => setSection("home")}
          />
          
          <View className="px-1">
            {addresses.length === 0 ? (
              <EmptyState
                title="Nowhere to deliver yet?"
                subtitle="Save your home or office address now for a lightning fast checkout experience later!"
                actionLabel="Add My First Address"
                onAction={() => setIsAddAddressVisible(true)}
                image={require("../../assets/images/characters/address/empty.png")}
              />
            ) : (
              <>
                {addresses.map((address) => (
                  <View
                    key={address.addressId}
                    className="bg-white rounded-2xl p-4 mb-3 border border-gray-50"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-[#FFF0F1] items-center justify-center mr-3">
                          <MapPin size={16} color="#E23744" />
                        </View>
                        <Text className="text-[14px] font-bold text-[#1C1C1C]">
                          {address.label || "Address"}
                        </Text>
                      </View>
                      {address.isDefault ? (
                        <View className="px-2 py-0.5 rounded-full bg-[#E23744]">
                          <Text className="text-[9px] text-white font-black uppercase">
                            Default
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View className="mt-3 pl-11">
                      <Text className="text-[13px] text-gray-600 leading-relaxed">
                        {address.addressLine1}
                      </Text>
                      <Text className="text-[11px] text-[#93959F] mt-1">
                        {address.city}, {address.state} {address.postalCode}
                      </Text>
                    </View>

                    <View className="flex-row justify-end mt-4 pt-4 border-t border-gray-50">
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Delete address?",
                            "This address will be removed from your account.",
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => deleteAddress(address.addressId),
                              },
                            ]
                          );
                        }}
                        className="px-4 py-2 rounded-xl bg-red-50"
                      >
                        <Text className="text-[11px] text-red-600 font-bold uppercase">
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Add New Address — only when addresses already exist */}
                <TouchableOpacity
                  onPress={() => setIsAddAddressVisible(true)}
                  className="flex-row items-center justify-center py-4 mt-2 rounded-2xl border-2 border-dashed"
                  style={{ borderColor: 'rgba(226,55,68,0.3)', backgroundColor: 'rgba(255,240,241,0.5)' }}
                  activeOpacity={0.8}
                >
                  <MapPin size={16} color="#E23744" strokeWidth={2.5} />
                  <Text className="ml-2 text-[13px] font-bold text-[#E23744]">
                    Add New Address
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        <AddAddressModal
          visible={isAddAddressVisible}
          onClose={() => setIsAddAddressVisible(false)}
          onAdd={addAddress}
        />
      </View>
    );
  }

  if (section === "notifications") {
    const preferences = notificationPreferences || {
      orderUpdates: true,
      offersAndPromos: true,
      reminders: true,
      systemMessages: true,
    };

    return (
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        <SectionHeader title="Notifications" onBack={() => setSection("home")} />

        <View className="bg-white rounded-2xl p-5 mb-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
          <Text className="text-[15px] font-semibold text-[#1C1C1C] mb-1">
            Push preferences
          </Text>
          <Text className="text-[12px] text-[#686B78] mb-4">
            Order updates stay fast. Offers and reminders can be tuned anytime.
          </Text>

          {[
            ["orderUpdates", "Order updates"],
            ["offersAndPromos", "Offers and promos"],
            ["reminders", "Reminders"],
            ["systemMessages", "System messages"],
          ].map(([key, label]) => (
            <View
              key={key}
              className="flex-row items-center justify-between py-3 border-t border-gray-100"
            >
              <View className="pr-3 flex-1">
                <Text className="text-[14px] font-medium text-[#1C1C1C]">{label}</Text>
                <Text className="text-[11px] text-[#686B78] mt-0.5">
                  {key === "offersAndPromos"
                    ? "Campaigns, launches, and seasonal deals."
                    : key === "orderUpdates"
                    ? "Real-time progress for active orders."
                    : key === "reminders"
                    ? "Cart and reorder nudges."
                    : "Service and account updates."}
                </Text>
              </View>
              <Switch
                value={Boolean(preferences[key])}
                onValueChange={(value) => handlePreferenceToggle(key, value)}
                trackColor={{ false: "#D1D5DB", true: "#FCD5D8" }}
                thumbColor={preferences[key] ? "#E23744" : "#F9FAFB"}
              />
            </View>
          ))}

          <Text className="text-[11px] text-[#93959F] mt-4">
            Permission: {notificationState.permissionStatus || "UNDETERMINED"}
          </Text>
        </View>

        <Text className="text-sm font-semibold text-[#93959F] mb-3">
          Recent updates
        </Text>

        {notificationsError ? (
          <Text className="text-[12px] text-red-600 mb-3">{notificationsError}</Text>
        ) : null}

        {loadingNotifications ? (
          <View className="flex-1 items-center justify-center p-10">
            <ActivityIndicator size="large" color="#E23744" />
            <Text className="text-[#93959F] mt-4 font-medium">
              Loading notifications...
            </Text>
          </View>
        ) : notificationFeed.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            subtitle="Order progress, reminders, and campaigns will land here."
            image={require("../../assets/images/characters/orders/empty.png")}
          />
        ) : (
          notificationFeed.map((item) => (
            <NotificationCard
              key={item.notificationEventId}
              item={item}
              onPress={openNotificationItem}
            />
          ))
        )}
      </ScrollView>
    );
  }

  if (section === "about") {
    return <AboutPage onBack={() => setSection("home")} />;
  }

  if (section !== "home") {
    return (
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        <SectionHeader title="Coming Soon" onBack={() => setSection("home")} />
        <EmptyState
          title="We are polishing this space"
          subtitle="More quick commerce features are on the way."
          image={require("../../assets/images/characters/payments/main.png")}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
      {/* ── Back header (when opened from AdminPanel) ── */}
      {onBack && (
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={onBack} className="mr-3 p-2 rounded-full bg-white">
            <ChevronLeft size={18} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-[#1C1C1C]">Account Settings</Text>
        </View>
      )}
      {/* ── Greeting Banner ── */}
      <View className="bg-[#1E1E2E] rounded-2xl p-5 mb-4">
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-full items-center justify-center mr-4 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Image
              source={require("../../assets/images/characters/profile/user.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          <View className="flex-1">
            <Text className="text-white text-[18px] font-bold">
              {displayName}
            </Text>
            <View className="flex-row items-center mt-1.5 flex-wrap">
              {profile.phoneNumber ? (
                <View className="flex-row items-center rounded-full px-2.5 py-0.5 mr-2 mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Text className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{profile.phoneNumber}</Text>
                </View>
              ) : null}
              {isValidEmail(profile.email) ? (
                <View className="flex-row items-center rounded-full px-2.5 py-0.5 mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Text className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{profile.email}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setSection("profile")}
                  className="flex-row items-center rounded-full px-2.5 py-0.5 mb-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Text className="text-[#FC8019] text-[11px] font-bold">+ Add email ›</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {profileError ? (
          <Text className="text-[11px] text-red-400 mt-2">{profileError}</Text>
        ) : null}
        {loadingProfile ? (
          <View className="mt-2 flex-row items-center">
            <ActivityIndicator size="small" color="#fff" />
            <Text className="text-[11px] ml-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Syncing...</Text>
          </View>
        ) : null}
      </View>

      {/* ── Amazon-Style 2x Grid ── */}
      <View className="flex-row flex-wrap justify-between">
        {quickCommerceItems.map((item) => {
          const IconCmp = item.icon;
          return (
            <TouchableOpacity
              key={item.title}
              onPress={item.onPress}
              className="bg-white rounded-2xl p-4 mb-3"
              style={{ width: "48.5%", shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
              activeOpacity={0.85}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                style={{ backgroundColor: item.iconBg }}
              >
                <IconCmp size={20} color={item.iconColor} />
              </View>
              <Text className="text-[14px] font-bold text-[#1C1C1C]">{item.title}</Text>
              <Text className="text-[11px] text-[#93959F] mt-0.5">{item.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>



      {/* ── Logout ── */}
      <TouchableOpacity
        onPress={handleLogout}
        disabled={isLoggingOut}
        className="flex-row items-center justify-center py-4 mt-2 rounded-2xl bg-white"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
        activeOpacity={0.85}
      >
        {isLoggingOut ? (
          <ActivityIndicator size="small" color="#DC2626" />
        ) : (
          <>
            <LogOut size={16} color="#DC2626" />
            <Text className="ml-2 text-[13px] font-semibold text-red-600">
              Log out
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const ProfileEditor = ({ profile, loading, error, onSave, onReload }) => {
  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [lastName, setLastName] = useState(profile.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || "");

  useEffect(() => {
    setFirstName(profile.firstName || "");
    setLastName(profile.lastName || "");
    setPhoneNumber(profile.phoneNumber || "");
  }, [profile.firstName, profile.lastName, profile.phoneNumber]);

  return (
    <View className="bg-white rounded-2xl p-5" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
      <Text className="text-[13px] text-[#686B78] mb-2">First name</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter first name"
        className="border border-gray-200 rounded-xl px-3 py-3 mb-4 text-gray-800"
      />
      <Text className="text-[13px] text-[#686B78] mb-2">Last name</Text>
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter last name"
        className="border border-gray-200 rounded-xl px-3 py-3 mb-4 text-gray-800"
      />
      <Text className="text-[13px] text-[#686B78] mb-2">Phone number</Text>
      <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        className="border border-gray-200 rounded-xl px-3 py-3 mb-5 text-gray-800"
      />

      {error ? <Text className="text-[12px] text-red-600 mb-3">{error}</Text> : null}

      <TouchableOpacity
        onPress={() => onSave({ firstName, lastName, phoneNumber })}
        className="bg-[#E23744] rounded-xl py-3 items-center flex-row justify-center"
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
        <Text className="text-white font-semibold text-[13px]">
          {loading ? "Saving changes..." : "Save changes"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onReload}
        className="mt-3 items-center"
        disabled={loading}
      >
        <Text className="text-[12px] text-[#686B78]">Reload from server</Text>
      </TouchableOpacity>
    </View>
  );
};


export default AccountHub;

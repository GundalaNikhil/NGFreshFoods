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
} from "lucide-react-native";
import authFirebase from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { authAtom } from "../../recoil/atoms/authAtom";
import { notificationAtom } from "../../recoil/atoms/notificationAtom";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import {
  fetchNotificationFeed,
  fetchNotificationPreferences,
  fetchMyOrders,
  fetchMyProfile,
  unregisterCurrentDevice,
  updateNotificationPreferences,
  updateMyProfile,
} from "../../services/bff/accountBff";
import { setAuthTokens } from "../../services/http/apiClient";
import { clearCachedData, getCachedData, setCachedData } from "../../utils/localCache";
import OrderDetailScreen from "../Cart/OrderDetailScreen";
import AddAddressModal from "../Home/AddAddressModal";
import { useAddress } from "../../hooks/useAddress";

const ACCOUNT_CACHE_TTL_MS = 2 * 60 * 1000;

const SectionButton = ({ title, subtitle, icon: IconCmp, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-4 mb-3 shadow-sm"
    activeOpacity={0.85}
  >
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-full items-center justify-center bg-emerald-50">
        <IconCmp size={20} color="#107A4A" />
      </View>
      <View className="ml-3">
        <Text className="text-[15px] font-semibold text-gray-900">{title}</Text>
        {subtitle ? (
          <Text className="text-[12px] text-gray-500 mt-0.5">{subtitle}</Text>
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
    <Text className="text-lg font-bold text-gray-900">{title}</Text>
  </View>
);

const EmptyState = ({ title, subtitle, actionLabel, onAction, image }) => (
  <View className="bg-white rounded-2xl p-6 items-center shadow-sm">
    {image ? (
      <Image 
        source={image} 
        style={{ width: 140, height: 140, marginBottom: 16 }} 
        resizeMode="contain"
      />
    ) : null}
    <Text className="text-base font-semibold text-gray-900 mb-1">{title}</Text>
    {subtitle ? (
      <Text className="text-[12px] text-gray-500 text-center">{subtitle}</Text>
    ) : null}
    {actionLabel ? (
      <TouchableOpacity
        onPress={onAction}
        className="mt-4 px-4 py-2 rounded-full bg-emerald-600"
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

  // Status color coding
  const statusConfig = (() => {
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
        return { bg: "bg-amber-50", text: "text-amber-700", label: "Processing" };
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
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      activeOpacity={0.85}
      onPress={() => onPress && onPress(order)}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-gray-900">
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

      <Text className="text-[12px] text-gray-400 mt-1">
        {createdAt ? createdAt.toDateString() : "Order date unavailable"}
      </Text>

      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-50">
        <View className="flex-row items-center">
          {paymentMethod ? (
            <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-full mr-2">
              <CreditCard size={12} color="#6B7280" strokeWidth={2} />
              <Text className="text-[10px] text-gray-500 font-semibold ml-1">
                {paymentMethod}
              </Text>
            </View>
          ) : null}
          <Text className="text-[12px] text-gray-500">
            {order?.orderItems?.length || 0} items
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-[14px] font-bold text-gray-900 mr-1">
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
    className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
    activeOpacity={0.85}
    onPress={() => onPress && onPress(item)}
  >
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-[14px] font-semibold text-gray-900">{item.title}</Text>
        <Text className="text-[12px] text-gray-600 mt-1 leading-5">{item.body}</Text>
      </View>
      <View className="px-2 py-1 rounded-full bg-emerald-50">
        <Text className="text-[10px] font-semibold text-emerald-700">
          {(item.eventType || "UPDATE").replace(/_/g, " ")}
        </Text>
      </View>
    </View>
    <Text className="text-[11px] text-gray-400 mt-3">
      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Just now"}
    </Text>
  </TouchableOpacity>
);

const AccountHub = () => {
  const navigation = useNavigation();
  const auth = useRecoilValue(authAtom);
  const setAuth = useSetRecoilState(authAtom);
  const resetProfile = useResetRecoilState(profileAtom);
  const [profile, setProfile] = useRecoilState(profileAtom);
  const [notificationState, setNotificationState] = useRecoilState(notificationAtom);

  const [section, setSection] = useState("home");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [notificationsError, setNotificationsError] = useState("");
  const [orders, setOrders] = useState([]);
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
    const response = await fetchMyProfile({ token: auth.token });
    if (response.success) {
      setProfile(response.data.profile);
    } else {
      setProfileError(response.error.message || "Failed to load profile.");
    }
    setLoadingProfile(false);
  }, [auth.token, setProfile]);

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

    const response = await fetchMyOrders({ token: auth.token });
    if (response.success) {
      const nextOrders = response.data.orders || [];
      setOrders(nextOrders);
      setCachedData(cacheKey, nextOrders);
    } else {
      setOrdersError(response.error.message || "Failed to load orders.");
    }
    setLoadingOrders(false);
  }, [auth.token, profile.phoneNumber, profile.userId]);

  const loadNotifications = useCallback(async () => {
    setNotificationsError("");
    const cacheKey = `notifications:${profile.userId || profile.phoneNumber || "current"}`;
    const cachedNotifications = await getCachedData(cacheKey, ACCOUNT_CACHE_TTL_MS);

    if (cachedNotifications) {
      setNotificationState((prev) => ({
        ...prev,
        preferences: cachedNotifications.preferences || prev.preferences,
        feed: cachedNotifications.feed || prev.feed,
      }));
      setLoadingNotifications(false);
    } else {
      setLoadingNotifications(true);
    }

    const [prefsResponse, feedResponse] = await Promise.all([
      fetchNotificationPreferences({ token: auth.token }),
      fetchNotificationFeed({ token: auth.token }),
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

    setNotificationState((prev) => ({
      ...prev,
      preferences: prefsResponse.success ? prefsResponse.data : prev.preferences,
      feed: feedResponse.success ? feedResponse.data.notifications || [] : prev.feed,
    }));

    if (prefsResponse.success && feedResponse.success) {
      setCachedData(cacheKey, {
        preferences: prefsResponse.data,
        feed: feedResponse.data.notifications || [],
      });
    }

    setLoadingNotifications(false);
  }, [
    auth.token,
    profile.phoneNumber,
    profile.userId,
    setNotificationState,
  ]);


  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", resetToHome);
    return unsubscribe;
  }, [navigation, resetToHome]);

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
      await unregisterCurrentDevice({ token: auth.token });
    } catch (_error) {
      // Device cleanup is best effort.
    }

    try {
      await authFirebase().signOut();
    } catch (error) {
      console.error("Firebase logout error:", error);
    }

    setAuth((prev) => ({
      ...prev,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
    }));
    resetProfile();
    setAuthTokens({});
    clearCachedData(`orders:${profile.userId || profile.phoneNumber || "current"}`);
    clearCachedData(`notifications:${profile.userId || profile.phoneNumber || "current"}`);
    setIsLoggingOut(false);
  };

  const handlePreferenceToggle = async (key, value) => {
    const nextPreferences = {
      ...(notificationState.preferences || {}),
      [key]: value,
    };

    setNotificationState((prev) => ({
      ...prev,
      preferences: nextPreferences,
    }));

    const response = await updateNotificationPreferences({
      token: auth.token,
      payload: nextPreferences,
    });

    if (!response.success) {
      setNotificationsError(
        response.error.message || "Failed to update notification preferences."
      );
      loadNotifications();
      return;
    }

    setNotificationState((prev) => ({
      ...prev,
      preferences: response.data,
    }));
  };

  const openNotificationItem = (item) => {
    let payload = {};
    try {
      payload = item.payloadJson ? JSON.parse(item.payloadJson) : {};
    } catch (_error) {
      payload = {};
    }

    if (payload.orderId) {
      setNotificationState((prev) => ({
        ...prev,
        intent: {
          orderId: payload.orderId,
          targetScreen: payload.targetScreen || "orders",
          deepLink: payload.deepLink || item.deepLink || null,
        },
        intentUpdatedAt: new Date().toISOString(),
      }));
      setSection("orders");
      return;
    }

    const targetScreen = String(
      payload.targetScreen || item.targetScreen || item.deepLink || ""
    ).toLowerCase();

    if (
      targetScreen.includes("notifications") ||
      targetScreen.includes("notification")
    ) {
      setNotificationState((prev) => ({
        ...prev,
        intent: {
          orderId: null,
          targetScreen: "notifications",
          deepLink: payload.deepLink || item.deepLink || null,
        },
        intentUpdatedAt: new Date().toISOString(),
      }));
      setSection("notifications");
      return;
    }

    Alert.alert(item.title || "Notification", item.body || "No additional details.");
  };

  const quickCommerceItems = [
    {
      title: "Your Orders",
      subtitle: "Track, manage and reorder",
      icon: Receipt,
      onPress: () => setSection("orders"),
    },
    {
      title: "Profile",
      subtitle: "Update your personal details",
      icon: User,
      onPress: () => setSection("profile"),
    },
    {
      title: "Saved Addresses",
      subtitle: "Add or edit delivery spots",
      icon: MapPin,
      onPress: () => setSection("addresses"),
    },
    {
      title: "Payments",
      subtitle: "Saved cards and UPI",
      icon: CreditCard,
      onPress: () => setSection("payments"),
    },
    {
      title: "Notifications",
      subtitle: "Order updates and offers",
      icon: Bell,
      onPress: () => setSection("notifications"),
    },
    {
      title: "Help & Support",
      subtitle: "Chat with us anytime",
      icon: LifeBuoy,
      onPress: () => setSection("support"),
    },
    {
      title: "Refer & Earn",
      subtitle: "Invite friends for rewards",
      icon: Gift,
      onPress: () => setSection("refer"),
    },
    {
      title: "Preferences",
      subtitle: "Taste, delivery, and more",
      icon: Settings,
      onPress: () => setSection("preferences"),
    },
  ];

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
            <ActivityIndicator size="large" color="#107A4A" />
            <Text className="text-gray-400 mt-4 font-medium">Fetching orders...</Text>
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
      <ScrollView className="flex-1">
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
              token: auth.token,
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
                    className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-50"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-3">
                          <MapPin size={16} color="#107A4A" />
                        </View>
                        <Text className="text-[14px] font-bold text-gray-900">
                          {address.label || "Address"}
                        </Text>
                      </View>
                      {address.isDefault ? (
                        <View className="px-2 py-0.5 rounded-full bg-emerald-600">
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
                      <Text className="text-[11px] text-gray-400 mt-1">
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
                  className="flex-row items-center justify-center py-4 mt-2 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50"
                  activeOpacity={0.8}
                >
                  <MapPin size={16} color="#107A4A" strokeWidth={2.5} />
                  <Text className="ml-2 text-[13px] font-bold text-emerald-700">
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
    const preferences = notificationState.preferences || {
      orderUpdates: true,
      offersAndPromos: true,
      reminders: true,
      systemMessages: true,
    };

    return (
      <ScrollView className="flex-1">
        <SectionHeader title="Notifications" onBack={() => setSection("home")} />

        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <Text className="text-[15px] font-semibold text-gray-900 mb-1">
            Push preferences
          </Text>
          <Text className="text-[12px] text-gray-500 mb-4">
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
                <Text className="text-[14px] font-medium text-gray-900">{label}</Text>
                <Text className="text-[11px] text-gray-500 mt-0.5">
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
                trackColor={{ false: "#D1D5DB", true: "#A7F3D0" }}
                thumbColor={preferences[key] ? "#107A4A" : "#F9FAFB"}
              />
            </View>
          ))}

          <Text className="text-[11px] text-gray-400 mt-4">
            Permission: {notificationState.permissionStatus || "UNDETERMINED"}
          </Text>
        </View>

        <Text className="text-sm font-semibold text-gray-700 mb-3">
          Recent updates
        </Text>

        {notificationsError ? (
          <Text className="text-[12px] text-red-600 mb-3">{notificationsError}</Text>
        ) : null}

        {loadingNotifications ? (
          <View className="flex-1 items-center justify-center p-10">
            <ActivityIndicator size="large" color="#107A4A" />
            <Text className="text-gray-400 mt-4 font-medium">
              Loading notifications...
            </Text>
          </View>
        ) : notificationState.feed.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            subtitle="Order progress, reminders, and campaigns will land here."
            image={require("../../assets/images/characters/orders/empty.png")}
          />
        ) : (
          notificationState.feed.map((item) => (
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

  if (section !== "home") {
    return (
      <ScrollView className="flex-1">
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
    <ScrollView className="flex-1">
      <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-2xl bg-emerald-50 items-center justify-center mr-4 border border-emerald-100 overflow-hidden">
              <Image 
                source={require("../../assets/images/characters/profile/user.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
            <View>
              <Text className="text-lg font-bold text-gray-900">{displayName}</Text>
              <Text className="text-[12px] text-gray-500 mt-1">
                {profile.email || "Email not available"}
              </Text>
              <Text className="text-[12px] text-gray-500 mt-1">
                {profile.phoneNumber || "Phone not available"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="px-3 py-2 rounded-full bg-red-50 flex-row items-center"
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <LogOut size={16} color="#DC2626" />
                <Text className="ml-2 text-[11px] font-semibold text-red-600">
                  Logout
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        {profileError ? (
          <Text className="text-[11px] text-red-600 mt-3">{profileError}</Text>
        ) : null}
        {loadingProfile ? (
          <View className="mt-3 flex-row items-center">
            <ActivityIndicator size="small" color="#107A4A" />
            <Text className="text-[11px] text-gray-400 ml-2">Refreshing profile...</Text>
          </View>
        ) : null}
      </View>

      <Text className="text-sm font-semibold text-gray-700 mb-3">
        Account essentials
      </Text>
      {quickCommerceItems.map((item) => (
        <SectionButton key={item.title} {...item} />
      ))}
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
    <View className="bg-white rounded-2xl p-5 shadow-sm">
      <Text className="text-[13px] text-gray-500 mb-2">First name</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter first name"
        className="border border-gray-200 rounded-xl px-3 py-3 mb-4 text-gray-800"
      />
      <Text className="text-[13px] text-gray-500 mb-2">Last name</Text>
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter last name"
        className="border border-gray-200 rounded-xl px-3 py-3 mb-4 text-gray-800"
      />
      <Text className="text-[13px] text-gray-500 mb-2">Phone number</Text>
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
        className="bg-emerald-600 rounded-xl py-3 items-center flex-row justify-center"
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
        <Text className="text-[12px] text-gray-500">Reload from server</Text>
      </TouchableOpacity>
    </View>
  );
};


export default AccountHub;

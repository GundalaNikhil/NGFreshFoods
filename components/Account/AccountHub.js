import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
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
import { authAtom } from "../../recoil/atoms/authAtom";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import {
  createAddress,
  deleteAddress,
  fetchMyAddresses,
  fetchMyOrders,
  fetchMyProfile,
  updateAddress,
  updateMyProfile,
} from "../../services/bff/accountBff";
import { setAuthTokens } from "../../services/http/apiClient";
import OrderDetailScreen from "../Cart/OrderDetailScreen";
import AddAddressModal from "../Home/AddAddressModal";
import { useAddress } from "../../hooks/useAddress";

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

const AccountHub = () => {
  const auth = useRecoilValue(authAtom);
  const resetAuth = useResetRecoilState(authAtom);
  const resetProfile = useResetRecoilState(profileAtom);
  const [profile, setProfile] = useRecoilState(profileAtom);

  const [section, setSection] = useState("home");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [orders, setOrders] = useState([]);
  const { addresses, refreshAddresses, deleteAddress, addAddress } = useAddress();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAddAddressVisible, setIsAddAddressVisible] = useState(false);

  const displayName = useMemo(() => {
    if (profile.fullName?.trim()) return profile.fullName;
    const stitched = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
    return stitched || "Fresh Shopper";
  }, [profile.firstName, profile.lastName, profile.fullName]);

  const loadProfile = async () => {
    setLoadingProfile(true);
    setProfileError("");
    const response = await fetchMyProfile({ token: auth.token });
    if (response.success) {
      setProfile(response.data.profile);
    } else {
      setProfileError(response.error.message || "Failed to load profile.");
    }
    setLoadingProfile(false);
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    setOrdersError("");
    const response = await fetchMyOrders({ token: auth.token });
    if (response.success) {
      setOrders(response.data.orders || []);
    } else {
      setOrdersError(response.error.message || "Failed to load orders.");
    }
    setLoadingOrders(false);
  };


  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (section === "orders") loadOrders();
    if (section === "addresses") refreshAddresses();
  }, [section]);

  const handleLogout = async () => {
    try {
      await authFirebase().signOut();
    } catch (error) {
      console.error("Firebase logout error:", error);
    }

    resetAuth();
    resetProfile();
    setAuthTokens({});
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
      <ScrollView className="flex-1">
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
          orders.map((order) => (
            <OrderCard
              key={order.orderId || order.razorPayOrderId}
              order={order}
              onPress={(o) => {
                setSelectedOrder(o);
                setSection("orderDetail");
              }}
            />
          ))
        )}
      </ScrollView>
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
            className="px-3 py-2 rounded-full bg-red-50 flex-row items-center"
          >
            <LogOut size={16} color="#DC2626" />
            <Text className="ml-2 text-[11px] font-semibold text-red-600">
              Logout
            </Text>
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

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
  Linking,
  Platform,
  StatusBar,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingBag,
  ArrowUpDown,
} from "lucide-react-native";
import { fetchAllOrders, updateOrderStatus, initiateRefund } from "../../services/bff/adminBff";
import { ListSkeleton } from "./shared/SkeletonLoader";
import EmptyState from "./shared/EmptyState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0;

const formatAddress = (addr) => {
  if (!addr) return "No Address Provided";
  if (typeof addr === "string") {
    try {
      const parsed = JSON.parse(addr);
      return formatAddress(parsed);
    } catch {
      return addr;
    }
  }
  const parts = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.postalCode].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Invalid Address Format";
};

const STATUS_COLORS = {
  PENDING: { bg: "#FFF3E0", text: "#E65100", icon: Clock },
  CONFIRMED: { bg: "#E3F2FD", text: "#1565C0", icon: CheckCircle },
  PREPARING: { bg: "#EDE7F6", text: "#4527A0", icon: Package },
  OUT_FOR_DELIVERY: { bg: "#FFF8E1", text: "#F57F17", icon: Truck },
  DELIVERED: { bg: "#E8F5E9", text: "#2E7D32", icon: CheckCircle },
  CANCELLED: { bg: "#FFEBEE", text: "#C62828", icon: XCircle },
};

const PAYMENT_STATUS_COLORS = {
  PENDING: { bg: "#FEF3C7", text: "#92400E" },
  AUTHORIZED: { bg: "#DBEAFE", text: "#1E40AF" },
  SUCCESS: { bg: "#D1FAE5", text: "#065F46" },
  FAILED: { bg: "#FEE2E2", text: "#991B1B" },
  REFUND_INITIATED: { bg: "#EDE9FE", text: "#5B21B6" },
  REFUNDED: { bg: "#E0E7FF", text: "#3730A3" },
};

const isPaymentPending = (order) =>
  order?.orderStatus === "PENDING" &&
  order?.paymentProvider !== "COD" &&
  order?.paymentStatus &&
  order.paymentStatus !== "SUCCESS" &&
  order.paymentStatus !== "REFUNDED";

const canRefund = (order) =>
  order?.orderStatus === "CANCELLED" &&
  order?.paymentProvider !== "COD" &&
  order?.paymentStatus === "SUCCESS";

const STATUS_FLOW = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
const FILTERS = ["ALL", ...STATUS_FLOW, "CANCELLED"];

// Short labels for filter chips to avoid overflow
const FILTER_LABELS = {
  ALL: "All",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Delivering",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// ── Order Detail Bottom Sheet ──
const OrderDetailSheet = ({ order, visible, onClose, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const statusStyle = STATUS_COLORS[order.orderStatus] || STATUS_COLORS.PENDING;
  const StatusIcon = statusStyle.icon;
  const currentIdx = STATUS_FLOW.indexOf(order.orderStatus);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await onStatusChange(order.orderId, newStatus);
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
        <Pressable style={{ flex: 0.2 }} onPress={onClose} />
        <View
          style={{
            flex: 0.8,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          {/* Handle */}
          <View style={{ alignItems: "center", paddingTop: 10 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#D1D1D6" }} />
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: "800", color: "#1C1C1E" }}>
                  #{order.orderNumber}
                </Text>
                <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F2F2F7",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} color="#8E8E93" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Status Badge */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: statusStyle.bg,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  alignSelf: "flex-start",
                }}
              >
                <StatusIcon size={16} color={statusStyle.text} strokeWidth={2} />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: statusStyle.text,
                    marginLeft: 6,
                  }}
                >
                  {order.orderStatus?.replace(/_/g, " ")}
                </Text>
              </View>
              {/* Payment Status Chip */}
              {order.paymentStatus && (() => {
                const pStyle = PAYMENT_STATUS_COLORS[order.paymentStatus] || { bg: "#F2F2F7", text: "#3C3C43" };
                const label = isPaymentPending(order)
                  ? "⏳ Payment Pending"
                  : order.paymentProvider === "COD" ? "💵 COD" : `💳 ${order.paymentStatus?.replace(/_/g, " ")}`;
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: pStyle.bg,
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "700", color: pStyle.text }}>
                      {label}
                    </Text>
                  </View>
                );
              })()}
            </View>

            {/* Order Items */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#8E8E93",
                marginTop: 24,
                marginBottom: 10,
                letterSpacing: 0.5,
              }}
            >
              ITEMS
            </Text>
            {(order.orderItems || []).map((item, idx) => (
              <View
                key={item.orderItemId || idx}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderBottomWidth: idx < (order.orderItems || []).length - 1 ? 1 : 0,
                  borderBottomColor: "#F2F2F7",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#1C1C1E" }}>
                    {item.orderName}
                  </Text>
                  {item.customizations ? (
                    <Text style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>
                      {item.customizations}
                    </Text>
                  ) : null}
                  <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>
                    ₹{item.unitPrice} × {item.quantity}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1C1C1E" }}>
                  ₹{item.subtotal?.toLocaleString("en-IN")}
                </Text>
              </View>
            ))}

            {/* Pricing Summary */}
            <View
              style={{
                backgroundColor: "#F8F8FC",
                borderRadius: 14,
                padding: 16,
                marginTop: 16,
              }}
            >
              {order.discountAmount > 0 && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: "#8E8E93" }}>Discount</Text>
                  <Text style={{ fontSize: 13, color: "#2E7D32", fontWeight: "600" }}>
                    -₹{order.discountAmount?.toLocaleString("en-IN")}
                  </Text>
                </View>
              )}
              {order.deliveryFee > 0 && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: "#8E8E93" }}>Delivery Fee</Text>
                  <Text style={{ fontSize: 13, color: "#1C1C1E", fontWeight: "500" }}>
                    ₹{order.deliveryFee?.toLocaleString("en-IN")}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderTopWidth: 1,
                  borderTopColor: "#EEEFF3",
                  paddingTop: 8,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#1C1C1E" }}>Total</Text>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#1C1C1E" }}>
                  ₹{order.totalAmount?.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>

            {/* Shipping Address */}
            {order.shippingAddress ? (
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#8E8E93",
                    marginBottom: 8,
                    letterSpacing: 0.5,
                  }}
                >
                  DELIVERY ADDRESS
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    backgroundColor: "#F8F8FC",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <MapPin size={16} color="#8E8E93" strokeWidth={2} style={{ marginTop: 2 }} />
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#3C3C43",
                      marginLeft: 10,
                      flex: 1,
                      lineHeight: 19,
                    }}
                  >
                    {formatAddress(order.shippingAddress)}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Status Actions */}
            {order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED" && (
              <View style={{ marginTop: 24 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#8E8E93",
                    marginBottom: 10,
                    letterSpacing: 0.5,
                  }}
                >
                  ACTIONS
                </Text>
                {isPaymentPending(order) && (
                  <View style={{ backgroundColor: "#FEF3C7", borderRadius: 12, padding: 12, marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, color: "#92400E", fontWeight: "600" }}>
                      ⏳ Waiting for payment confirmation. Status actions will be available once payment is confirmed.
                    </Text>
                  </View>
                )}
                {!isPaymentPending(order) && (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {STATUS_FLOW.slice(currentIdx + 1).map((status) => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => handleStatusChange(status)}
                        disabled={updating}
                        style={{
                          backgroundColor: status === nextStatus ? "#2C2C2E" : "#F2F2F7",
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          opacity: updating ? 0.6 : 1,
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={{ color: status === nextStatus ? "#FFFFFF" : "#1C1C1E", fontSize: 13, fontWeight: "700" }}>
                          {status === nextStatus ? "→ " : ""}{status.replace(/_/g, " ")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
                          { text: "No" },
                          {
                            text: "Yes, Cancel",
                            onPress: () => handleStatusChange("CANCELLED"),
                            style: "destructive",
                          },
                        ]);
                      }}
                      style={{
                        backgroundColor: "#FFEBEE",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={{ color: "#C62828", fontSize: 13, fontWeight: "700" }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Refund Action for Cancelled + Paid Orders */}
            {canRefund(order) && (
              <View style={{ marginTop: 20 }}>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Initiate Refund",
                      `Are you sure you want to refund ₹${order.totalAmount?.toLocaleString("en-IN")} for order #${order.orderNumber}?`,
                      [
                        { text: "No" },
                        {
                          text: "Yes, Refund",
                          style: "destructive",
                          onPress: () => {
                            Alert.alert(
                              "Final Confirmation",
                              "This action cannot be undone. The refund will be processed to the customer's original payment method.",
                              [
                                { text: "Cancel" },
                                {
                                  text: "Confirm Refund",
                                  style: "destructive",
                                  onPress: async () => {
                                    try {
                                      setUpdating(true);
                                      const result = await initiateRefund(order.orderId);
                                      Alert.alert(
                                        result.success ? "Refund Initiated" : "Refund Failed",
                                        result.message || "Unknown result"
                                      );
                                      onClose();
                                    } catch (e) {
                                      Alert.alert("Error", e?.message || "Failed to initiate refund");
                                    } finally {
                                      setUpdating(false);
                                    }
                                  },
                                },
                              ]
                            );
                          },
                        },
                      ]
                    );
                  }}
                  disabled={updating}
                  style={{
                    backgroundColor: "#EDE9FE",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: updating ? 0.6 : 1,
                  }}
                  activeOpacity={0.8}
                >
                  <CreditCard size={16} color="#5B21B6" strokeWidth={2} />
                  <Text style={{ color: "#5B21B6", fontSize: 14, fontWeight: "700", marginLeft: 8 }}>Refund ₹{order.totalAmount?.toLocaleString("en-IN")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ── Order Card ──
const OrderCard = ({ order, onStatusChange, onPress }) => {
  const [updating, setUpdating] = useState(false);
  const statusStyle = STATUS_COLORS[order.orderStatus] || { bg: "#F2F2F7", text: "#3C3C43" };
  const StatusIcon = statusStyle.icon || ShoppingBag;

  const currentIdx = STATUS_FLOW.indexOf(order.orderStatus);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  const handleQuickStatusChange = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await onStatusChange(order.orderId, nextStatus);
    } finally {
      setUpdating(false);
    }
  };

  const itemCount = order.orderItems?.length || 0;

  return (
    <Reanimated.View layout={Layout.springify()}>
      <TouchableOpacity
        onPress={() => onPress(order)}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 16,
          marginHorizontal: 16,
          marginBottom: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Status Icon */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: statusStyle.bg,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <StatusIcon size={18} color={statusStyle.text} strokeWidth={2} />
          </View>

          {/* Order Info */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1C1C1E" }}>
              #{order.orderNumber}
            </Text>
            <Text style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>
              {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
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

          {/* Amount & Status */}
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#1C1C1E" }}>
              ₹{order.totalAmount?.toLocaleString("en-IN")}
            </Text>
            <View
              style={{
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginTop: 4,
                backgroundColor: statusStyle.bg,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: statusStyle.text,
                  letterSpacing: 0.3,
                }}
              >
                {isPaymentPending(order) ? "⏳ Pay Pending" : order.orderStatus?.replace(/_/g, " ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Status Action */}
        {currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 && !isPaymentPending(order) && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {STATUS_FLOW.slice(currentIdx + 1).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={(e) => {
                  e.stopPropagation?.();
                  if (updating) return;
                  setUpdating(true);
                  onStatusChange(order.orderId, status).finally(() => setUpdating(false));
                }}
                disabled={updating}
                style={{
                  flex: 1,
                  minWidth: 100,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  borderRadius: 10,
                  backgroundColor: status === nextStatus ? "#F8F8FC" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#EEEFF3",
                  opacity: updating ? 0.6 : 1,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 11, fontWeight: status === nextStatus ? "700" : "600", color: "#3C3C43" }}>
                  {status === nextStatus ? "Move to → " : ""}{status.replace(/_/g, " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {isPaymentPending(order) && (
          <View style={{ marginTop: 10, backgroundColor: "#FEF3C7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: "#92400E" }}>⏳ Awaiting payment</Text>
          </View>
        )}
      </TouchableOpacity>
    </Reanimated.View>
  );
};

// ── Filter Chip ──
const FilterChip = ({ label, active, count, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      backgroundColor: active ? "#1C1C1E" : "#FFFFFF",
      borderWidth: 1,
      borderColor: active ? "#1C1C1E" : "#EEEFF3",
    }}
    activeOpacity={0.7}
  >
    <Text
      style={{
        fontSize: 13,
        fontWeight: "600",
        color: active ? "#FFFFFF" : "#8E8E93",
      }}
    >
      {label}
      {count > 0 ? ` (${count})` : ""}
    </Text>
  </TouchableOpacity>
);

// ── Main Component ──
const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("date_desc");
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const {
    data: ordersData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["adminOrders", "ALL"],
    queryFn: () => fetchAllOrders(null),
    refetchInterval: 30000, // Silent background refresh every 30s
  });

  const handleManualRefresh = useCallback(async () => {
    setManualRefreshing(true);
    await refetch();
    setManualRefreshing(false);
  }, [refetch]);

  const orders = Array.isArray(ordersData) ? ordersData : [];

  const handleStatusChange = async (orderId, newStatus) => {
    // Optimistic update
    queryClient.setQueryData(["adminOrders", "ALL"], (oldData) => {
      if (!oldData) return [];
      return oldData.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));
    });

    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (e) {
      // Rollback
      refetch();
      Alert.alert("Error", e?.message || "Failed to update status");
    }
  };

  // Status counts for filter badges
  const statusCounts = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      counts[o.orderStatus] = (counts[o.orderStatus] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Filtered + searched + sorted orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (filter !== "ALL") {
      result = result.filter((o) => o.orderStatus === filter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          (o.orderNumber || "").toLowerCase().includes(query) ||
          (o.shippingAddress || "").toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortOrder === "date_desc") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortOrder === "date_asc") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sortOrder === "price_desc") {
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      } else if (sortOrder === "price_asc") {
        return (a.totalAmount || 0) - (b.totalAmount || 0);
      }
      return 0;
    });

    return result;
  }, [orders, filter, searchQuery, sortOrder]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8FC" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: STATUSBAR_HEIGHT + 8,
          paddingHorizontal: 20,
          paddingBottom: 8,
          backgroundColor: "#F8F8FC",
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: "800", color: "#1C1C1E" }}>Orders</Text>
        <Text style={{ fontSize: 13, color: "#8E8E93", marginTop: 2 }}>
          {orders.length} total · {statusCounts.PENDING || 0} pending
        </Text>
      </View>

      {/* Search Bar & Sort */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: Platform.OS === "ios" ? 10 : 4,
            borderWidth: 1,
            borderColor: "#EEEFF3",
          }}
        >
          <Search size={18} color="#C7C7CC" strokeWidth={2} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by order #, address..."
            placeholderTextColor="#C7C7CC"
            style={{
              flex: 1,
              fontSize: 14,
              color: "#1C1C1E",
              marginLeft: 10,
              fontWeight: "500",
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color="#C7C7CC" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setSortModalVisible(true)}
          style={{
            marginLeft: 10,
            width: 42,
            height: 42,
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#EEEFF3",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowUpDown size={18} color="#3C3C43" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={{ height: 50, marginBottom: 8, width: "100%" }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <FilterChip
              label={FILTER_LABELS[item] || item}
              active={filter === item}
              count={item === "ALL" ? 0 : statusCounts[item] || 0}
              onPress={() => setFilter(item)}
            />
          )}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 32, alignItems: "center" }}
        />
      </View>

      {/* Orders List */}
      {loading ? (
        <ListSkeleton count={6} />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.orderId}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onStatusChange={handleStatusChange}
              onPress={setSelectedOrder}
            />
          )}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={manualRefreshing}
              onRefresh={handleManualRefresh}
              tintColor="#3C3C43"
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={ShoppingBag}
              title="No orders found"
              subtitle={
                searchQuery
                  ? "Try a different search term"
                  : filter !== "ALL"
                    ? `No ${filter.replace(/_/g, " ").toLowerCase()} orders`
                    : "Orders will appear here"
              }
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sort Modal */}
      <Modal visible={sortModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <Pressable style={{ flex: 1 }} onPress={() => setSortModalVisible(false)} />
          <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1C1C1E" }}>Sort Orders By</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <X size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            {[
              { id: "date_desc", label: "Date (Newest First)" },
              { id: "date_asc", label: "Date (Oldest First)" },
              { id: "price_desc", label: "Price (High to Low)" },
              { id: "price_asc", label: "Price (Low to High)" },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => {
                  setSortOrder(option.id);
                  setSortModalVisible(false);
                }}
                style={{
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F2F2F7",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: sortOrder === option.id ? "600" : "400", color: sortOrder === option.id ? "#1C1C1E" : "#3C3C43" }}>
                  {option.label}
                </Text>
                {sortOrder === option.id && <CheckCircle size={18} color="#2E7D32" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Order Detail Sheet */}
      <OrderDetailSheet
        order={selectedOrder}
        visible={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />
    </View>
  );
};

export default AdminOrders;

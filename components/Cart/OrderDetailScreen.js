import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Check,
  ChevronLeft,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
} from "lucide-react-native";
import { fetchOrderById } from "../../services/bff/accountBff";

// ── Status timeline config ──
const TIMELINE_STEPS = [
  { key: "PENDING",            label: "Order Placed",        icon: ShoppingBag },
  { key: "CONFIRMED",          label: "Confirmed",           icon: Check },
  { key: "PREPARING",          label: "Preparing",           icon: UtensilsCrossed },
  { key: "OUT_FOR_DELIVERY",   label: "Out for Delivery",    icon: Truck },
  { key: "DELIVERED",          label: "Delivered",            icon: Package },
];

const STATUS_INDEX = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  CANCELLED: -1,
};

const getStatusColor = (status) => {
  switch (status) {
    case "CONFIRMED":
    case "PREPARING":
    case "OUT_FOR_DELIVERY":
      return { bg: "#DCFCE7", text: "#16A34A", dot: "#16A34A" };
    case "DELIVERED":
      return { bg: "#DBEAFE", text: "#2563EB", dot: "#2563EB" };
    case "CANCELLED":
      return { bg: "#FEE2E2", text: "#DC2626", dot: "#DC2626" };
    default: // PENDING
      return { bg: "#FEF3C7", text: "#D97706", dot: "#D97706" };
  }
};

/**
 * OrderDetailScreen – full order detail with status timeline, items, payment info.
 *
 * Props:
 *   orderId   – UUID string of the order to load
 *   order     – optional pre-loaded order object (if coming from success screen)
 *   onBack    – () => void
 */
const OrderDetailScreen = ({ orderId, order: initialOrder, onBack }) => {
  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const lineAnim = useRef(new Animated.Value(0)).current;

  const loadOrder = useCallback(
    async (isRefresh = false) => {
      const id = orderId || initialOrder?.orderId;
      if (!id) return;
      if (!isRefresh) setLoading(true);
      setError(null);
      const result = await fetchOrderById(id);
      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.error?.message || "Failed to load order.");
      }
      setLoading(false);
      setRefreshing(false);
    },
    [orderId, initialOrder?.orderId]
  );

  useEffect(() => {
    if (!initialOrder) {
      loadOrder();
    }
  }, [initialOrder, loadOrder]);

  // Animate timeline on order load
  useEffect(() => {
    if (order) {
      const activeIdx = STATUS_INDEX[order.orderStatus] ?? 0;
      Animated.timing(lineAnim, {
        toValue: activeIdx,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [order?.orderStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrder(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={{ color: "#9CA3AF", marginTop: 12, fontWeight: "600" }}>
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <StatusBar barStyle="dark-content" />
        <Header orderNumber="" onBack={onBack} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 }}>
            Unable to load order
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 20 }}>
            {error || "Something went wrong."}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: "#16A34A", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}
            onPress={() => loadOrder()}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const orderNumber = order.orderNumber || order.orderId?.slice(0, 10) || "—";
  const activeIdx = STATUS_INDEX[order.orderStatus] ?? 0;
  const isCancelled = order.orderStatus === "CANCELLED";
  const statusColor = getStatusColor(order.orderStatus);
  const createdAt = order.createdAt ? new Date(order.createdAt) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />
      <Header orderNumber={orderNumber} onBack={onBack} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16A34A" />
        }
      >
        {/* ── Status Banner ── */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 8,
            backgroundColor: statusColor.bg,
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: statusColor.dot,
              marginRight: 10,
            }}
          />
          <Text style={{ fontSize: 15, fontWeight: "800", color: statusColor.text, flex: 1 }}>
            {isCancelled ? "Order Cancelled" : order.orderStatus?.replace(/_/g, " ")}
          </Text>
          {order.estimatedDeliveryTime && !isCancelled && order.orderStatus !== "DELIVERED" && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Clock size={14} color={statusColor.text} strokeWidth={2.5} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: statusColor.text, marginLeft: 4 }}>
                {order.estimatedDeliveryTime}
              </Text>
            </View>
          )}
        </View>

        {/* ── Status Timeline ── */}
        {!isCancelled && (
          <View style={{ marginHorizontal: 16, marginTop: 24, marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: "#9CA3AF",
                letterSpacing: 1.5,
                marginBottom: 16,
              }}
            >
              ORDER TIMELINE
            </Text>
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = idx <= activeIdx;
              const isActive = idx === activeIdx;
              const isLast = idx === TIMELINE_STEPS.length - 1;
              const StepIcon = step.icon;

              return (
                <View key={step.key} style={{ flexDirection: "row", minHeight: isLast ? 40 : 56 }}>
                  {/* Left: dot + line */}
                  <View style={{ width: 40, alignItems: "center" }}>
                    <View
                      style={{
                        width: isActive ? 32 : 24,
                        height: isActive ? 32 : 24,
                        borderRadius: isActive ? 16 : 12,
                        backgroundColor: isCompleted ? "#16A34A" : "#E5E7EB",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: isActive ? 3 : 0,
                        borderColor: isActive ? "#BBF7D0" : "transparent",
                      }}
                    >
                      <StepIcon
                        size={isActive ? 14 : 12}
                        color={isCompleted ? "#fff" : "#9CA3AF"}
                        strokeWidth={2.5}
                      />
                    </View>
                    {!isLast && (
                      <View
                        style={{
                          flex: 1,
                          width: 2,
                          backgroundColor: idx < activeIdx ? "#16A34A" : "#E5E7EB",
                          marginVertical: 4,
                        }}
                      />
                    )}
                  </View>

                  {/* Right: label */}
                  <View style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 16, justifyContent: "center" }}>
                    <Text
                      style={{
                        fontSize: isActive ? 15 : 14,
                        fontWeight: isActive ? "800" : "600",
                        color: isCompleted ? "#111827" : "#9CA3AF",
                      }}
                    >
                      {step.label}
                    </Text>
                    {isActive && createdAt && idx === 0 && (
                      <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                        {createdAt.toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Cancelled Banner ── */}
        {isCancelled && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 20,
              backgroundColor: "#FEF2F2",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#DC2626", marginBottom: 4 }}>
              This order was cancelled
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              If you were charged, a refund will be processed within 3-5 business days.
            </Text>
          </View>
        )}

        {/* ── Order Items ── */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "800",
              color: "#9CA3AF",
              letterSpacing: 1.5,
              marginBottom: 12,
            }}
          >
            ORDER ITEMS ({order.orderItems?.length || 0})
          </Text>
          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            {(order.orderItems || []).map((item, idx) => (
              <View
                key={item.orderItemId || idx}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderBottomWidth: idx < (order.orderItems?.length || 0) - 1 ? 1 : 0,
                  borderBottomColor: "#E5E7EB",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>
                    {item.orderName || "Item"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                    Qty: {item.quantity} × ₹{Number(item.unitPrice || 0).toFixed(2)}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#111827" }}>
                  ₹{Number(item.subtotal || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Bill Summary ── */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "800",
              color: "#9CA3AF",
              letterSpacing: 1.5,
              marginBottom: 12,
            }}
          >
            BILL SUMMARY
          </Text>
          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <BillRow label="Subtotal" value={`₹${(Number(order.totalAmount || 0) + Number(order.discountAmount || 0) - Number(order.deliveryFee || 0)).toFixed(2)}`} />
            {Number(order.discountAmount || 0) > 0 && (
              <BillRow
                label="Discount"
                value={`-₹${Number(order.discountAmount).toFixed(2)}`}
                valueColor="#16A34A"
              />
            )}
            <BillRow
              label="Delivery Fee"
              value={Number(order.deliveryFee || 0) === 0 ? "FREE" : `₹${Number(order.deliveryFee).toFixed(2)}`}
              valueColor={Number(order.deliveryFee || 0) === 0 ? "#16A34A" : "#111827"}
            />
            <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 15, fontWeight: "900", color: "#111827" }}>Total Paid</Text>
              <Text style={{ fontSize: 15, fontWeight: "900", color: "#111827" }}>
                ₹{Number(order.totalAmount || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Payment Info ── */}
        {order.payment && (
          <View style={{ marginHorizontal: 16, marginTop: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: "#9CA3AF",
                letterSpacing: 1.5,
                marginBottom: 12,
              }}
            >
              PAYMENT
            </Text>
            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#F3F4F6",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#ECFDF5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <CreditCard size={20} color="#16A34A" strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>
                  {order.payment.paymentMethod || order.payment.transactionType || "Online Payment"}
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Status: {order.payment.paymentStatus || "—"}
                </Text>
                {order.payment.transactionId && (
                  <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                    Txn: {order.payment.transactionId}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ── Order placed date ── */}
        {createdAt && (
          <View style={{ marginHorizontal: 16, marginTop: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: "#9CA3AF",
                letterSpacing: 1.5,
                marginBottom: 12,
              }}
            >
              ORDER PLACED
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>
              {createdAt.toLocaleString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        )}

        {/* ── Need Help ── */}
        <View style={{ marginHorizontal: 16, marginTop: 32 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 14,
              height: 50,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
          >
            <Phone size={16} color="#374151" strokeWidth={2} />
            <Text style={{ color: "#374151", fontWeight: "700", fontSize: 14, marginLeft: 8 }}>
              Need Help?
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Sub-components ──

const Header = ({ orderNumber, onBack }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
    }}
  >
    <TouchableOpacity
      onPress={onBack}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
      }}
    >
      <ChevronLeft size={20} color="#111827" strokeWidth={2.5} />
    </TouchableOpacity>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>Order Details</Text>
      {orderNumber ? (
        <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500" }}>#{orderNumber}</Text>
      ) : null}
    </View>
  </View>
);

const BillRow = ({ label, value, valueColor }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
    <Text style={{ fontSize: 13, color: "#6B7280", fontWeight: "500" }}>{label}</Text>
    <Text style={{ fontSize: 13, fontWeight: "700", color: valueColor || "#111827" }}>{value}</Text>
  </View>
);

export default OrderDetailScreen;

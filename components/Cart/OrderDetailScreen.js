/* global setTimeout, clearTimeout, clearInterval, setInterval */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  AlertTriangle,
  ChevronLeft,
  Clock,
  CreditCard,
  Phone,
  RefreshCw,
} from "lucide-react-native";
import { fetchOrderById } from "../../services/bff/accountBff";
import { retryPayment, verifyPayment } from "../../services/bff/paymentBff";
import { useRecoilValue } from "recoil";
import { profileAtom } from "../../recoil/atoms/profileAtom";

const getRazorpayModule = () => {
  try {
    const mod = require("react-native-razorpay");
    return mod?.default || mod;
  } catch (e) {
    return null;
  }
};

// ── Pixar 3D illustrations for each timeline step ──
const TIMELINE_IMAGES = {
  PENDING: require("../../assets/images/characters/orders/tracking/order_placed.png"),
  CONFIRMED: require("../../assets/images/characters/orders/tracking/order_confirmed.png"),
  PREPARING: require("../../assets/images/characters/orders/tracking/order_preparing.png"),
  OUT_FOR_DELIVERY: require("../../assets/images/characters/orders/tracking/order_out_delivery.png"),
  DELIVERED: require("../../assets/images/characters/orders/tracking/order_delivered.png"),
};

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Order Placed", subtitle: "We've received your order" },
  { key: "CONFIRMED", label: "Confirmed", subtitle: "Your order is confirmed" },
  { key: "PREPARING", label: "Preparing", subtitle: "Your food is being prepared" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", subtitle: "On the way to you!" },
  { key: "DELIVERED", label: "Delivered", subtitle: "Enjoy your meal!" },
];

const PAYMENT_PENDING_STEP = {
  key: "PAYMENT_PENDING",
  label: "Payment Pending",
  subtitle: "We are waiting for the final payment update",
};

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
    default:
      return { bg: "#FEF3C7", text: "#D97706", dot: "#D97706" };
  }
};

const isPaymentPendingOrder = (order) => {
  const paymentStatus = String(order?.payment?.paymentStatus || "").toUpperCase();
  return (
    order?.orderStatus === "PENDING" &&
    paymentStatus &&
    paymentStatus !== "SUCCESS" &&
    paymentStatus !== "REFUNDED"
  );
};

/**
 * Determines if this order's payment is retryable (FAILED + window open + retries left).
 */
const isPaymentRetryable = (order) => {
  const payment = order?.payment;
  if (!payment) return false;
  const paymentStatus = String(payment.paymentStatus || "").toUpperCase();
  if (paymentStatus !== "FAILED") return false;
  // Backend sends retryAvailable flag
  if (payment.retryAvailable === true) return true;
  // Fallback: check manually if retry metadata exists
  if (payment.retryExpiresAt) {
    const expiresAt = new Date(payment.retryExpiresAt);
    const now = new Date();
    const retriesLeft = (payment.maxRetryCount || 3) - (payment.retryCount || 0);
    return now < expiresAt && retriesLeft > 0;
  }
  return false;
};

/**
 * Calculates remaining seconds until retry window expires.
 */
const getRetryTimeRemaining = (retryExpiresAt) => {
  if (!retryExpiresAt) return 0;
  const expiresAt = new Date(retryExpiresAt);
  const now = new Date();
  return Math.max(0, Math.floor((expiresAt - now) / 1000));
};

const formatTimeRemaining = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * OrderDetailScreen – Premium order detail with Pixar 3D timeline.
 */
const OrderDetailScreen = ({ orderId, order: initialOrder, onBack }) => {
  const profile = useRecoilValue(profileAtom);
  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Refresh cooldown for payment pending state
  const [refreshCooldown, setRefreshCooldown] = useState(60);

  // ── Retry Payment State ──
  const [retryState, setRetryState] = useState("IDLE"); // IDLE | RETRYING | AWAITING_PAYMENT | VERIFYING | SUCCESS | ERROR
  const [retryError, setRetryError] = useState(null);
  const [retryTimeLeft, setRetryTimeLeft] = useState(0);

  // Countdown timer for retry window
  useEffect(() => {
    const expiresAt = order?.payment?.retryExpiresAt;
    if (!expiresAt || !isPaymentRetryable(order)) {
      setRetryTimeLeft(0);
      return;
    }
    setRetryTimeLeft(getRetryTimeRemaining(expiresAt));
    const interval = setInterval(() => {
      const remaining = getRetryTimeRemaining(expiresAt);
      setRetryTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        loadOrder(true); // Refresh to get updated status (likely cancelled)
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [order?.payment?.retryExpiresAt, order?.payment?.paymentStatus]);

  // ── Retry Payment Handler ──
  const handleRetryPayment = useCallback(async () => {
    const currentOrderId = order?.orderId;
    if (!currentOrderId || retryState !== "IDLE") return;

    setRetryState("RETRYING");
    setRetryError(null);

    try {
      // Step 1: Call backend retry endpoint
      const result = await retryPayment(currentOrderId);

      if (!result.success) {
        const errorCode = result.error?.code || "UNKNOWN";
        const errorMsg = result.error?.message || "Failed to retry payment";
        if (errorCode === "RETRY_WINDOW_EXPIRED" || errorCode === "MAX_RETRIES_EXCEEDED") {
          Alert.alert("Cannot Retry", errorMsg, [{ text: "OK" }]);
          setRetryState("IDLE");
          loadOrder(true); // Refresh to show updated (likely cancelled) status
          return;
        }
        throw new Error(errorMsg);
      }

      const retryData = result.data;
      const razorpayOrderId = retryData?.razorpayOrderId;
      const razorpayKeyId = retryData?.razorpayKeyId;
      const amount = retryData?.amount || order?.totalAmount || 0;

      if (!razorpayOrderId || !razorpayKeyId) {
        throw new Error("Payment configuration missing from retry response.");
      }

      // Step 2: Open Razorpay Checkout
      setRetryState("AWAITING_PAYMENT");

      const RazorpayCheckout = getRazorpayModule();
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== "function") {
        throw new Error("Payment module not available. Please rebuild the app.");
      }

      const rzpOptions = {
        description: "FreshFoods Order",
        image: "https://i.imgur.com/3g7nmJC.png",
        currency: "INR",
        key: razorpayKeyId,
        amount: Math.round(amount * 100),
        name: "FreshFoods",
        order_id: razorpayOrderId,
        prefill: {
          email: profile?.email || "",
          contact: profile?.phoneNumber || "",
          name: profile?.fullName || profile?.firstName || "",
        },
        theme: { color: "#16A34A" },
        retry: { enabled: true, max_count: 3 },
      };

      const rzpResponse = await RazorpayCheckout.open(rzpOptions);

      // Step 3: Verify payment
      setRetryState("VERIFYING");

      const verifyResult = await verifyPayment({
        orderId: currentOrderId,
        razorpayOrderId: rzpResponse.razorpay_order_id,
        razorpayPaymentId: rzpResponse.razorpay_payment_id,
        razorpaySignature: rzpResponse.razorpay_signature,
      });

      if (verifyResult.success) {
        setRetryState("SUCCESS");
        // Reload order to reflect new confirmed status
        setTimeout(() => {
          loadOrder(true);
          setRetryState("IDLE");
        }, 1500);
      } else {
        throw new Error(verifyResult.error?.message || "Payment verification failed.");
      }
    } catch (err) {
      const msg = err?.message || "";
      const isCancelled =
        msg.toLowerCase().includes("cancelled") ||
        msg.toLowerCase().includes("canceled") ||
        msg.toLowerCase().includes("dismissed") ||
        err?.code === 0 ||
        err?.code === 2;

      if (isCancelled) {
        // User dismissed Razorpay — not an error, just go back to idle
        setRetryState("IDLE");
        return;
      }

      setRetryError(msg || "Something went wrong. Please try again.");
      setRetryState("ERROR");
      // Auto-reset error state after 5 seconds
      setTimeout(() => {
        setRetryState("IDLE");
        setRetryError(null);
        loadOrder(true);
      }, 5000);
    }
  }, [order, retryState, profile]);

  useEffect(() => {
    let timer = null;
    if (refreshCooldown > 0) {
      timer = setTimeout(() => {
        setRefreshCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [refreshCooldown]);

  // Animations for timeline steps
  const stepAnims = useRef(
    TIMELINE_STEPS.map(() => ({
      scale: new Animated.Value(0.5),
      opacity: new Animated.Value(0),
    }))
  ).current;

  // Hero image animation
  const heroScale = useRef(new Animated.Value(0.8)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

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

  // Animate timeline steps sequentially
  useEffect(() => {
    if (order) {
      const activeIdx = STATUS_INDEX[order.orderStatus] ?? 0;

      // Hero image
      Animated.parallel([
        Animated.spring(heroScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Stagger timeline steps
      const animations = stepAnims.slice(0, activeIdx + 1).map((anim, idx) =>
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            tension: 80,
            friction: 8,
            delay: idx * 150,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 300,
            delay: idx * 150,
            useNativeDriver: true,
          }),
        ])
      );
      Animated.parallel(animations).start();
    }
  }, [order?.orderStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshCooldown(60);
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
  const paymentPending = isPaymentPendingOrder(order);
  const activeIdx = paymentPending ? 0 : STATUS_INDEX[order.orderStatus] ?? 0;
  const isCancelled = order.orderStatus === "CANCELLED";
  const statusColor = getStatusColor(order.orderStatus);
  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
  const activeStep = paymentPending
    ? PAYMENT_PENDING_STEP
    : TIMELINE_STEPS[Math.min(activeIdx, TIMELINE_STEPS.length - 1)] || TIMELINE_STEPS[0];
  const activeStepKey = paymentPending ? "PENDING" : activeStep.key;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFFFE" }}>
      <StatusBar barStyle="dark-content" />
      <Header orderNumber={orderNumber} onBack={onBack} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16A34A" />
        }
      >
        {/* ── Hero Illustration — sticker style with glow ── */}
        {!isCancelled && (
          <Animated.View
            style={{
              alignItems: "center",
              paddingTop: 12,
              paddingBottom: 8,
              opacity: heroOpacity,
              transform: [{ scale: heroScale }],
            }}
          >
            {/* Soft glow halos */}
            <View
              style={{
                position: "absolute",
                top: 20,
                width: 150,
                height: 150,
                borderRadius: 75,
                backgroundColor: "rgba(22, 163, 74, 0.05)",
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 35,
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: "rgba(22, 163, 74, 0.07)",
              }}
            />
            <Image
              source={TIMELINE_IMAGES[activeStepKey]}
              style={{ width: 170, height: 170 }}
              resizeMode="contain"
            />
          </Animated.View>
        )}

        {/* ── Status Banner ── */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 8,
            backgroundColor: statusColor.bg,
            borderRadius: 18,
            padding: 18,
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
              marginRight: 12,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "900", color: statusColor.text }}>
              {isCancelled ? "Order Cancelled" : activeStep.label}
            </Text>
            {!isCancelled && (
              <Text style={{ fontSize: 12, color: statusColor.text, fontWeight: "500", marginTop: 2, opacity: 0.8 }}>
                {activeStep.subtitle}
              </Text>
            )}
          </View>
          {order.estimatedDeliveryTime && !isCancelled && order.orderStatus !== "DELIVERED" && (
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
              <Clock size={13} color={statusColor.text} strokeWidth={2.5} />
              <Text style={{ fontSize: 12, fontWeight: "800", color: statusColor.text, marginLeft: 4 }}>
                {order.estimatedDeliveryTime}
              </Text>
            </View>
          )}
        </View>

        {/* ── Retry Payment Banner (FAILED + retryAvailable) ── */}
        {isPaymentRetryable(order) && !isCancelled && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 14,
              backgroundColor: "#FEF2F2",
              borderRadius: 18,
              padding: 18,
              borderWidth: 1.5,
              borderColor: "#FECACA",
            }}
          >
            {/* Header Row */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: "#FEE2E2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <AlertTriangle size={20} color="#DC2626" strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "900", color: "#991B1B" }}>
                  Payment Failed
                </Text>
                <Text style={{ fontSize: 11, color: "#B91C1C", fontWeight: "600", marginTop: 1 }}>
                  {order.payment?.failureReason || "Your payment could not be completed."}
                </Text>
              </View>
            </View>

            {/* Retry Info Pills */}
            <View style={{ flexDirection: "row", marginBottom: 14, gap: 8 }}>
              {retryTimeLeft > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#FEE2E2",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 10,
                  }}
                >
                  <Clock size={12} color="#DC2626" strokeWidth={2.5} />
                  <Text style={{ fontSize: 11, fontWeight: "800", color: "#DC2626", marginLeft: 4 }}>
                    {formatTimeRemaining(retryTimeLeft)} left
                  </Text>
                </View>
              )}
              <View
                style={{
                  backgroundColor: "#FEE2E2",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#DC2626" }}>
                  {(order.payment?.maxRetryCount || 3) - (order.payment?.retryCount || 0)} retries left
                </Text>
              </View>
            </View>

            {/* Retry CTA Button */}
            <TouchableOpacity
              style={{
                backgroundColor: retryState !== "IDLE" ? "#9CA3AF" : "#DC2626",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                shadowColor: "#DC2626",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: retryState !== "IDLE" ? 0 : 0.25,
                shadowRadius: 8,
                elevation: retryState !== "IDLE" ? 0 : 4,
              }}
              disabled={retryState !== "IDLE"}
              onPress={handleRetryPayment}
              activeOpacity={0.85}
            >
              {retryState === "RETRYING" || retryState === "VERIFYING" ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14, marginLeft: 8 }}>
                    {retryState === "VERIFYING" ? "Verifying Payment..." : "Preparing Retry..."}
                  </Text>
                </>
              ) : retryState === "AWAITING_PAYMENT" ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14, marginLeft: 8 }}>
                    Complete Payment in Razorpay...
                  </Text>
                </>
              ) : retryState === "SUCCESS" ? (
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 15 }}>
                  ✓ Payment Successful!
                </Text>
              ) : (
                <>
                  <RefreshCw size={16} color="#fff" strokeWidth={2.5} />
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 15, marginLeft: 8 }}>
                    Retry Payment
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Error message from retry attempt */}
            {retryState === "ERROR" && retryError && (
              <Text style={{ fontSize: 11, color: "#B91C1C", marginTop: 8, textAlign: "center", fontWeight: "600" }}>
                {retryError}
              </Text>
            )}

            {/* Reassurance text */}
            <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 10, textAlign: "center", lineHeight: 16 }}>
              Your order is safe. Same items, same price — just retry the payment.
            </Text>
          </View>
        )}

        {paymentPending && !isPaymentRetryable(order) && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 14,
              backgroundColor: "#FFFBEB",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#FDE68A",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#92400E", marginBottom: 6 }}>
              Do not pay again yet
            </Text>
            <Text style={{ fontSize: 12, color: "#92400E", lineHeight: 18, marginBottom: 12 }}>
              Your payment has not been confirmed yet. If money was debited, this order should update automatically once the payment is verified.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: refreshCooldown > 0 || refreshing ? "#FDE68A" : "#D97706",
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row"
              }}
              disabled={refreshCooldown > 0 || refreshing}
              onPress={onRefresh}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#92400E" />
              ) : (
                <Text style={{ 
                  color: refreshCooldown > 0 ? "#B45309" : "#FFFFFF", 
                  fontWeight: "700", 
                  fontSize: 13 
                }}>
                  {refreshCooldown > 0 
                    ? `Refresh Status (${refreshCooldown}s)` 
                    : "Refresh Status"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Payment / Order Timeline ── */}
        {!isCancelled && (
          <View style={{ marginHorizontal: 16, marginTop: 28, marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: "#9CA3AF",
                letterSpacing: 1.5,
                marginBottom: 20,
              }}
            >
              {paymentPending ? "PAYMENT STATUS" : "ORDER TIMELINE"}
            </Text>

            {(paymentPending ? [PAYMENT_PENDING_STEP] : TIMELINE_STEPS).map((step, idx, steps) => {
              const isCompleted = paymentPending || idx <= activeIdx;
              const isActive = paymentPending || idx === activeIdx;
              const isLast = idx === steps.length - 1;
              const anim = stepAnims[idx];

              return (
                <View key={step.key} style={{ flexDirection: "row", minHeight: isLast ? 60 : 80 }}>
                  {/* Left: Sticker-style illustration + connecting line */}
                  <View style={{ width: 60, alignItems: "center" }}>
                    <Animated.View
                      style={{
                        width: isActive ? 56 : 44,
                        height: isActive ? 56 : 44,
                        borderRadius: isActive ? 28 : 22,
                        backgroundColor: isCompleted ? "#ECFDF5" : "#F9FAFB",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: isCompleted ? anim.opacity : 0.35,
                        transform: [{ scale: isCompleted ? anim.scale : 1 }],
                        overflow: "hidden",
                        // Sticker-style soft shadow
                        shadowColor: isActive ? "#16A34A" : "#000",
                        shadowOffset: { width: 0, height: isActive ? 3 : 1 },
                        shadowOpacity: isActive ? 0.15 : 0.05,
                        shadowRadius: isActive ? 8 : 4,
                        elevation: isActive ? 4 : 1,
                      }}
                    >
                      <Image
                        source={TIMELINE_IMAGES[step.key] || TIMELINE_IMAGES.PENDING}
                        style={{
                          width: isActive ? 50 : 38,
                          height: isActive ? 50 : 38,
                        }}
                        resizeMode="cover"
                      />
                    </Animated.View>

                    {!isLast && (
                      <View
                        style={{
                          flex: 1,
                          width: 2.5,
                          backgroundColor: idx < activeIdx ? "#16A34A" : "#E5E7EB",
                          marginVertical: 4,
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </View>

                  {/* Right: label + subtitle */}
                  <View
                    style={{
                      flex: 1,
                      paddingLeft: 14,
                      paddingBottom: isLast ? 0 : 16,
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isActive ? 16 : 14,
                        fontWeight: isActive ? "900" : "600",
                        color: isCompleted ? "#111827" : "#C0C0C0",
                      }}
                    >
                      {step.label}
                    </Text>
                    {isActive && (
                      <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 3, fontWeight: "500" }}>
                        {step.subtitle}
                      </Text>
                    )}
                    {isActive && createdAt && idx === 0 && (
                      <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
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
              borderRadius: 16,
              padding: 18,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#DC2626", marginBottom: 6 }}>
              This order was cancelled
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", lineHeight: 18 }}>
              If you were charged, a refund will be processed within 3-5 business days.
            </Text>
          </View>
        )}

        {/* ── Order Items ── */}
        <View style={{ marginHorizontal: 16, marginTop: 28 }}>
          <Text style={{ fontSize: 11, fontWeight: "800", color: "#9CA3AF", letterSpacing: 1.5, marginBottom: 12 }}>
            ORDER ITEMS ({order.orderItems?.length || 0})
          </Text>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            {(order.orderItems || []).map((item, idx) => (
              <View
                key={item.orderItemId || idx}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: idx < (order.orderItems?.length || 0) - 1 ? 1 : 0,
                  borderBottomColor: "#F3F4F6",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>
                    {item.orderName || "Item"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>
                    {item.quantity} x ₹{Number(item.unitPrice || 0).toFixed(2)}
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
          <Text style={{ fontSize: 11, fontWeight: "800", color: "#9CA3AF", letterSpacing: 1.5, marginBottom: 12 }}>
            BILL SUMMARY
          </Text>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <BillRow
              label="Subtotal"
              value={`₹${(
                Number(order.totalAmount || 0) +
                Number(order.discountAmount || 0) -
                Number(order.deliveryFee || 0)
              ).toFixed(2)}`}
            />
            {Number(order.discountAmount || 0) > 0 && (
              <BillRow
                label="Discount"
                value={`-₹${Number(order.discountAmount).toFixed(2)}`}
                valueColor="#16A34A"
              />
            )}
            <BillRow
              label="Delivery Fee"
              value={
                Number(order.deliveryFee || 0) === 0
                  ? "FREE"
                  : `₹${Number(order.deliveryFee).toFixed(2)}`
              }
              valueColor={Number(order.deliveryFee || 0) === 0 ? "#16A34A" : "#111827"}
            />
            <View style={{ height: 1, backgroundColor: "#F3F4F6", marginVertical: 14 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#111827" }}>
                {paymentPending ? "Amount Due" : "Total Paid"}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#111827" }}>
                ₹{Number(order.totalAmount || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Payment Info ── */}
        {order.payment && (
          <View style={{ marginHorizontal: 16, marginTop: 24 }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#9CA3AF", letterSpacing: 1.5, marginBottom: 12 }}>
              PAYMENT
            </Text>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: order.payment.paymentStatus === "FAILED" ? "#FEF2F2" : "#ECFDF5",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <CreditCard size={22} color={order.payment.paymentStatus === "FAILED" ? "#DC2626" : "#16A34A"} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>
                    {order.payment.paymentMethod || order.payment.transactionType || "Online Payment"}
                  </Text>
                  <Text style={{ fontSize: 12, color: order.payment.paymentStatus === "FAILED" ? "#DC2626" : "#6B7280", marginTop: 2, fontWeight: order.payment.paymentStatus === "FAILED" ? "700" : "400" }}>
                    Status: {order.payment.paymentStatus || "—"}
                  </Text>
                  {order.payment.transactionId && (
                    <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                      Txn: {order.payment.transactionId}
                    </Text>
                  )}
                </View>
              </View>
              {/* Retry metadata — show attempt count if retried */}
              {(order.payment.retryCount > 0 || order.payment.retryAvailable) && (
                <View style={{ flexDirection: "row", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F3F4F6", gap: 8 }}>
                  {order.payment.retryCount > 0 && (
                    <View style={{ backgroundColor: "#F3F4F6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: "#6B7280" }}>
                        Attempt {(order.payment.retryCount || 0) + 1} of {(order.payment.maxRetryCount || 3) + 1}
                      </Text>
                    </View>
                  )}
                  {order.payment.retryAvailable && (
                    <View style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: "#16A34A" }}>
                        Retry Available
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Order placed date ── */}
        {createdAt && (
          <View style={{ marginHorizontal: 16, marginTop: 24 }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#9CA3AF", letterSpacing: 1.5, marginBottom: 8 }}>
              ORDERED ON
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
              borderRadius: 16,
              height: 52,
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
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
      backgroundColor: "#FAFFFE",
    }}
  >
    <TouchableOpacity
      onPress={onBack}
      style={{
        width: 38,
        height: 38,
        borderRadius: 14,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
      }}
    >
      <ChevronLeft size={20} color="#111827" strokeWidth={2.5} />
    </TouchableOpacity>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 17, fontWeight: "900", color: "#111827" }}>Track Order</Text>
      {orderNumber ? (
        <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500", marginTop: 1 }}>
          #{orderNumber}
        </Text>
      ) : null}
    </View>
  </View>
);

const BillRow = ({ label, value, valueColor }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
    <Text style={{ fontSize: 13, color: "#6B7280", fontWeight: "500" }}>{label}</Text>
    <Text style={{ fontSize: 13, fontWeight: "700", color: valueColor || "#111827" }}>{value}</Text>
  </View>
);

export default OrderDetailScreen;

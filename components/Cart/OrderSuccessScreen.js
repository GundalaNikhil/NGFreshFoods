import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  Home,
  Package,
  Receipt,
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * OrderSuccessScreen – Swiggy/Zomato-style order confirmation.
 *
 * Props:
 *   order       – the order object (orderId, orderNumber, totalAmount, orderItems, payment, estimatedDeliveryTime, createdAt)
 *   onTrackOrder  – () => void  (navigate to OrderDetailScreen)
 *   onGoHome      – () => void  (navigate to Home tab)
 */
const OrderSuccessScreen = ({ order, onTrackOrder, onGoHome }) => {
  // ── Animations ──
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(40)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 12 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // 1. Checkmark bounces in
    Animated.sequence([
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // 2. Confetti burst
      Animated.parallel(
        confettiAnims.map((anim, i) => {
          const angle = (i / 12) * 2 * Math.PI;
          const radius = 80 + Math.random() * 50;
          return Animated.parallel([
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim.x, {
              toValue: Math.cos(angle) * radius,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(anim.y, {
              toValue: Math.sin(angle) * radius - 30,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 600,
              delay: 300,
              useNativeDriver: true,
            }),
          ]);
        })
      ),
    ]).start();

    // 3. Content slides up
    Animated.parallel([
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 500,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const orderNumber = order?.orderNumber || order?.orderId?.slice(0, 10) || "—";
  const totalAmount = Number(order?.totalAmount || 0).toFixed(2);
  const itemCount = order?.orderItems?.length || 0;
  const paymentMethod = order?.payment?.paymentMethod || order?.payment?.transactionType || "Online";
  const estimatedDelivery = order?.estimatedDeliveryTime || "25-30 mins";
  const confettiColors = [
    "#16A34A", "#22C55E", "#4ADE80", "#86EFAC",
    "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6",
    "#EC4899", "#14B8A6", "#F97316", "#06B6D4",
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        {/* ── Animated Checkmark with Confetti ── */}
        <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 32, height: 160 }}>
          {/* Confetti dots */}
          {confettiAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: confettiColors[i % confettiColors.length],
                opacity: anim.opacity,
                transform: [
                  { translateX: anim.x },
                  { translateY: anim.y },
                  { scale: anim.scale },
                ],
              }}
            />
          ))}

          {/* Green circle + checkmark */}
          <Animated.View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#F0FDF4",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 3,
              borderColor: "#BBF7D0",
              opacity: checkOpacity,
              transform: [{ scale: checkScale }],
            }}
          >
            <CheckCircle size={52} color="#16A34A" strokeWidth={2.5} />
          </Animated.View>
        </View>

        {/* ── Content (slides up) ── */}
        <Animated.View
          style={{
            width: "100%",
            opacity: contentOpacity,
            transform: [{ translateY: contentSlide }],
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: 26,
              fontWeight: "900",
              color: "#111827",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            Order Placed! 🎉
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 20,
              marginBottom: 28,
            }}
          >
            Your order has been confirmed and is being prepared.{"\n"}
            Sit back and relax!
          </Text>

          {/* ── Order Info Card ── */}
          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 20,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            {/* Order Number */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
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
                <Receipt size={20} color="#16A34A" strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "700", letterSpacing: 1 }}>
                  ORDER NUMBER
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "900", color: "#111827", marginTop: 2 }}>
                  #{orderNumber}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#DCFCE7",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#16A34A" }}>CONFIRMED</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: "#E5E7EB", marginBottom: 16 }} />

            {/* Summary Row */}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ alignItems: "center", flex: 1 }}>
                <Package size={18} color="#6B7280" strokeWidth={2} />
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#111827", marginTop: 6 }}>
                  {itemCount}
                </Text>
                <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "600" }}>Items</Text>
              </View>
              <View style={{ width: 1, backgroundColor: "#E5E7EB" }} />
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "600" }}>Total Paid</Text>
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#111827", marginTop: 4 }}>
                  ₹{totalAmount}
                </Text>
                <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "600" }}>
                  via {paymentMethod}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Estimated Delivery Card ── */}
          <View
            style={{
              backgroundColor: "#ECFDF5",
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 28,
              borderWidth: 1,
              borderColor: "#BBF7D0",
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#DCFCE7",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Clock size={22} color="#16A34A" strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: "#16A34A", fontWeight: "800" }}>
                ESTIMATED DELIVERY
              </Text>
              <Text style={{ fontSize: 20, fontWeight: "900", color: "#111827", marginTop: 2 }}>
                {estimatedDelivery}
              </Text>
            </View>
            <Image
              source={require("../../assets/images/delivery_character.png")}
              style={{ width: 56, height: 56 }}
              resizeMode="contain"
            />
          </View>

          {/* ── CTA Buttons ── */}
          <TouchableOpacity
            style={{
              backgroundColor: "#16A34A",
              borderRadius: 16,
              height: 56,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              shadowColor: "#16A34A",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
            activeOpacity={0.9}
            onPress={onTrackOrder}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900", marginRight: 6 }}>
              Track Order
            </Text>
            <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 16,
              height: 52,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.9}
            onPress={onGoHome}
          >
            <Home size={18} color="#374151" strokeWidth={2} />
            <Text
              style={{
                color: "#374151",
                fontSize: 15,
                fontWeight: "700",
                marginLeft: 8,
              }}
            >
              Back to Home
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default OrderSuccessScreen;

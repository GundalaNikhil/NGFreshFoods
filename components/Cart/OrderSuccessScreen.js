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
import { ChevronRight, Clock, Home } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * OrderSuccessScreen – Premium Swiggy/Zomato-style order confirmation.
 *
 * Props:
 *   order       – the order object
 *   onTrackOrder  – () => void
 *   onGoHome      – () => void
 */
const OrderSuccessScreen = ({ order, onTrackOrder, onGoHome }) => {
  // ── Animations ──
  const heroScale = useRef(new Animated.Value(0.3)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const ctaSlide = useRef(new Animated.Value(40)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  // Confetti particles
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Hero image bounces in
    Animated.sequence([
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
      ]),
      // Confetti burst with rotation
      Animated.parallel(
        confettiAnims.map((anim, i) => {
          const angle = (i / 20) * 2 * Math.PI;
          const radius = 60 + Math.random() * 100;
          return Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 0.5 + Math.random() * 1,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(anim.x, {
              toValue: Math.cos(angle) * radius,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(anim.y, {
              toValue: Math.sin(angle) * radius - 40,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: Math.random() * 4 - 2,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 500,
              delay: 400,
              useNativeDriver: true,
            }),
          ]);
        })
      ),
    ]).start();

    // Card slides up
    Animated.parallel([
      Animated.spring(cardSlide, {
        toValue: 0,
        tension: 50,
        friction: 9,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // CTA slides up
    Animated.parallel([
      Animated.spring(ctaSlide, {
        toValue: 0,
        tension: 50,
        friction: 9,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(ctaOpacity, {
        toValue: 1,
        duration: 400,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Shimmer loop on the card
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const orderNumber =
    order?.orderNumber || order?.orderId?.slice(0, 10) || "—";
  const totalAmount = Number(order?.totalAmount || 0).toFixed(2);
  const itemCount = order?.orderItems?.length || 0;
  const paymentMethod =
    order?.payment?.paymentMethod ||
    order?.payment?.transactionType ||
    "Online";
  const estimatedDelivery = order?.estimatedDeliveryTime || "25-30 mins";

  // Item names preview
  const itemNames = (order?.orderItems || [])
    .slice(0, 3)
    .map((i) => i.orderName || "Item")
    .join(" • ");

  const confettiShapes = ["circle", "square", "diamond"];
  const confettiColors = [
    "#E23744", "#FC8019", "#F87171", "#FBBF24", "#60B246",
    "#F59E0B", "#EF4444", "#3B82F6", "#60A5FA", "#8B5CF6",
    "#A78BFA", "#EC4899", "#F472B6", "#14B8A6", "#2DD4BF",
    "#F97316", "#FB923C", "#06B6D4", "#22D3EE", "#E23744",
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFFFE" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFFFE" />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        {/* ── Hero Illustration with Confetti ── */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
            height: 220,
          }}
        >
          {/* Confetti particles */}
          {confettiAnims.map((anim, i) => {
            const shape = confettiShapes[i % confettiShapes.length];
            const size = 6 + (i % 4) * 2;
            return (
              <Animated.View
                key={i}
                style={{
                  position: "absolute",
                  width: size,
                  height: shape === "diamond" ? size : size,
                  borderRadius: shape === "circle" ? size / 2 : shape === "square" ? 2 : 0,
                  backgroundColor: confettiColors[i % confettiColors.length],
                  opacity: anim.opacity,
                  transform: [
                    { translateX: anim.x },
                    { translateY: anim.y },
                    { scale: anim.scale },
                    {
                      rotate: anim.rotate.interpolate({
                        inputRange: [-2, 2],
                        outputRange: ["-180deg", "180deg"],
                      }),
                    },
                  ],
                }}
              />
            );
          })}

          {/* Hero 3D illustration — sticker style with glow halo */}
          <Animated.View
            style={{
              opacity: heroOpacity,
              transform: [{ scale: heroScale }],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Soft glow halo behind the sticker */}
            <View
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: "rgba(226, 55, 68, 0.06)",
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "rgba(226, 55, 68, 0.08)",
              }}
            />
            <Image
              source={require("../../assets/images/characters/orders/tracking/payment_success.png")}
              style={{
                width: 190,
                height: 190,
              }}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* ── Title ── */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: "#111827",
            textAlign: "center",
            marginBottom: 4,
            letterSpacing: -0.5,
          }}
        >
          Yay! Order Placed! 🎉
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#6B7280",
            textAlign: "center",
            lineHeight: 20,
            marginBottom: 24,
            paddingHorizontal: 20,
          }}
        >
          Your fresh food is on its way! Sit back and relax.
        </Text>

        {/* ── Order Info Card ── */}
        <Animated.View
          style={{
            width: "100%",
            opacity: cardOpacity,
            transform: [{ translateY: cardSlide }],
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#E9E9EB",
              shadowColor: "#E23744",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 16,
              elevation: 3,
            }}
          >
            {/* Order Number + Status */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "800",
                    color: "#9CA3AF",
                    letterSpacing: 1.5,
                  }}
                >
                  ORDER
                </Text>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "900",
                    color: "#111827",
                    marginTop: 2,
                  }}
                >
                  #{orderNumber}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#DCFCE7",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#E23744",
                    marginRight: 6,
                  }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "800",
                    color: "#E23744",
                  }}
                >
                  CONFIRMED
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: "#F3F4F6",
                marginBottom: 16,
              }}
            />

            {/* Stats Row */}
            <View style={{ flexDirection: "row" }}>
              {/* Items */}
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "900",
                    color: "#111827",
                  }}
                >
                  {itemCount}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    fontWeight: "600",
                    marginTop: 2,
                  }}
                >
                  Items
                </Text>
              </View>

              {/* Vertical divider */}
              <View
                style={{
                  width: 1,
                  backgroundColor: "#F3F4F6",
                  marginHorizontal: 4,
                }}
              />

              {/* Amount */}
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "900",
                    color: "#111827",
                  }}
                >
                  ₹{totalAmount}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    fontWeight: "600",
                    marginTop: 2,
                  }}
                >
                  via {paymentMethod}
                </Text>
              </View>

              {/* Vertical divider */}
              <View
                style={{
                  width: 1,
                  backgroundColor: "#F3F4F6",
                  marginHorizontal: 4,
                }}
              />

              {/* ETA */}
              <View style={{ flex: 1, alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Clock size={16} color="#16A34A" strokeWidth={2.5} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "900",
                      color: "#E23744",
                      marginLeft: 4,
                    }}
                  >
                    {estimatedDelivery.split(" ")[0]}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    fontWeight: "600",
                    marginTop: 2,
                  }}
                >
                  Est. Delivery
                </Text>
              </View>
            </View>

            {/* Items Preview */}
            {itemNames ? (
              <View
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: "#F3F4F6",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {itemNames}
                  {(order?.orderItems?.length || 0) > 3
                    ? ` +${(order?.orderItems?.length || 0) - 3} more`
                    : ""}
                </Text>
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* ── CTA Buttons ── */}
        <Animated.View
          style={{
            width: "100%",
            opacity: ctaOpacity,
            transform: [{ translateY: ctaSlide }],
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#E23744",
              borderRadius: 18,
              height: 58,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              shadowColor: "#E23744",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 5,
            }}
            activeOpacity={0.9}
            onPress={onTrackOrder}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 17,
                fontWeight: "900",
                marginRight: 6,
              }}
            >
              Track Order
            </Text>
            <ChevronRight size={20} color="#fff" strokeWidth={3} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 18,
              height: 54,
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

import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, Animated } from "react-native";
import {
  ShoppingCart,
  ArrowRight,
  CreditCard,
  Shield,
} from "lucide-react-native";

const CartFooter = ({ total, itemCount }) => {
  const [buttonScale] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [shimmerAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Subtle pulse animation for the checkout button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Shimmer effect
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    shimmerAnimation.start();

    return () => {
      pulseAnimation.stop();
      shimmerAnimation.stop();
    };
  }, []);

  const handleCheckout = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Implement checkout logic
    console.log("Proceeding to checkout");
  };

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  if (itemCount === 0) return null;

  return (
    <View className="bg-white/98 backdrop-blur-sm border-t-2 border-emerald-100 px-5 py-5 pb-8 shadow-2xl shadow-black/10">
      {/* Summary Section */}
      <View className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 mb-4 border border-emerald-100">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="bg-emerald-500 p-2 rounded-xl mr-3">
              <ShoppingCart size={18} color="#ffffff" />
            </View>
            <View>
              <Text className="text-base text-gray-700 font-semibold">
                {itemCount} item{itemCount !== 1 ? "s" : ""} in cart
              </Text>
              <Text className="text-sm text-gray-500 font-medium">
                Ready for checkout
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-sm text-gray-600 font-medium">
              Total Amount
            </Text>
            <Text className="text-2xl font-black text-emerald-600 mt-0.5">
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Enhanced Checkout Button */}
      <Animated.View
        className="w-full"
        style={{
          transform: [{ scale: buttonScale }, { scale: pulseAnim }],
        }}
      >
        <TouchableOpacity
          onPress={handleCheckout}
          className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/40 border border-emerald-400"
          activeOpacity={0.9}
          style={{ elevation: 8 }}
        >
          {/* Shimmer Effect Overlay */}
          <Animated.View
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-24"
            style={{
              transform: [{ translateX: shimmerTranslateX }],
            }}
          />

          <View className="flex-row items-center justify-center py-5 px-6">
            <View className="bg-white/20 p-2 rounded-xl mr-3">
              <CreditCard size={20} color="#ffffff" />
            </View>

            <View className="flex-1 items-center">
              <Text className="text-lg font-bold text-white">
                Proceed to Checkout
              </Text>
              <Text className="text-sm text-emerald-100 font-medium mt-0.5">
                Secure payment guaranteed
              </Text>
            </View>

            <View className="bg-white/20 p-2 rounded-xl ml-3">
              <ArrowRight size={20} color="#ffffff" />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Security Badge */}
      <View className="flex-row items-center justify-center mt-3">
        <Shield size={16} color="#10b981" />
        <Text className="text-sm text-gray-600 font-medium ml-1.5">
          Secure checkout with 256-bit SSL encryption
        </Text>
      </View>
    </View>
  );
};

export default CartFooter;

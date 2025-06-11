import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, Animated } from "react-native";
import { useCart } from "../../hooks/useCart";

const CartItems = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [animatedValues] = useState(
    cart.reduce((acc, item) => {
      acc[item.productId] = {
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
      };
      return acc;
    }, {})
  );

  const animatePress = (productId) => {
    const anim = animatedValues[productId];
    if (anim) {
      Animated.sequence([
        Animated.timing(anim.scale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const animateRemove = (productId, callback) => {
    const anim = animatedValues[productId];
    if (anim) {
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(anim.scale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => callback());
    } else {
      callback();
    }
  };

  const renderCustomizations = (customizations) => {
    if (!customizations) return null;

    return (
      <View className="flex-row flex-wrap mb-2">
        {Object.entries(customizations).map(([key, value], index) => (
          <View
            key={index}
            className="bg-gray-100 px-2 py-1 rounded-lg mr-2 mb-1"
          >
            <Text className="text-xs text-gray-600 font-medium">
              {key}: {value}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const handleQuantityChange = (item, newQuantity) => {
    animatePress(item.productId);
    if (newQuantity === 0) {
      animateRemove(item.productId, () => {
        removeFromCart(item.productId);
      });
    } else {
      updateQuantity(item.productId, newQuantity);
    }
  };

  const handleRemove = (item) => {
    animateRemove(item.productId, () => {
      removeFromCart(item.productId);
    });
  };

  return (
    <View className="p-4">
      <Text className="text-xl font-bold text-gray-900 mb-4">Cart Items</Text>

      {cart.map((item) => {
        const animValue = animatedValues[item.productId] || {
          scale: new Animated.Value(1),
          opacity: new Animated.Value(1),
        };

        return (
          <Animated.View
            key={item.productId}
            className="mb-4"
            style={{
              transform: [{ scale: animValue.scale }],
              opacity: animValue.opacity,
            }}
          >
            <View className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50">
              <View className="flex-row items-start">
                {/* Product Image Placeholder */}
                <View className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl items-center justify-center">
                  <Image
                    source={{ uri: item.image }}
                    className="w-24 h-24 rounded-lg"
                    resizeMode="cover"
                  />
                </View>

                {/* Product Details */}
                <View className="flex-1 mr-3">
                  <Text className="text-base font-semibold text-gray-900 mb-2 leading-5">
                    {item.productName}
                  </Text>
                  {renderCustomizations(item.customizations)}

                  <View className="flex-row items-center">
                    <Text className="text-base font-bold text-emerald-600">
                      ₹{item.custPrice || item.itemPrice}
                    </Text>
                    {item.itemPrice !== item.custPrice && (
                      <Text className="text-sm text-gray-400 line-through ml-2">
                        ₹{item.itemPrice}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Quantity Controls */}
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() =>
                      handleQuantityChange(item, item.custQuantity - 1)
                    }
                    className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Minus size={16} color="#6b7280" />
                  </TouchableOpacity>

                  <View className="min-w-10 items-center mx-2">
                    <Text className="text-base font-semibold text-gray-900">
                      {item.custQuantity}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      handleQuantityChange(item, item.custQuantity + 1)
                    }
                    className="w-8 h-8 bg-emerald-500 rounded-lg items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Plus size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Total Price & Remove Button */}
              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <Text className="text-base font-bold text-gray-900">
                  Total: ₹{item.totalPrice}
                </Text>

                <TouchableOpacity
                  onPress={() => handleRemove(item)}
                  className="flex-row items-center px-3 py-1.5 bg-red-50 rounded-lg"
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color="#ef4444" />
                  <Text className="text-sm text-red-500 font-medium ml-1">
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

export default CartItems;

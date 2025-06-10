// components/Cart/CartSummary.jsx
import React from "react";
import { Text, View } from "react-native";

const CartSummary = ({ subtotal, discount, promoDiscount }) => {
  const total = subtotal - promoDiscount;

  return (
    <View className="bg-white p-4 mb-4">
      <Text className="font-bold text-lg mb-4">Price Details</Text>

      <View className="space-y-3">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Subtotal</Text>
          <Text className="font-bold">₹{subtotal.toFixed(2)}</Text>
        </View>

        {promoDiscount > 0 && (
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Product Discount</Text>
            <Text className="font-bold text-green-500">
              -₹{discount.toFixed(2)}
            </Text>
          </View>
        )}

        {promoDiscount > 0 && (
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Promo Discount</Text>
            <Text className="font-bold text-green-500">
              -₹{promoDiscount.toFixed(2)}
            </Text>
          </View>
        )}

        <View className="pt-3 border-t border-gray-200">
          <View className="flex-row justify-between">
            <Text className="font-bold text-lg">Total</Text>
            <Text className="font-bold text-lg">₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CartSummary;

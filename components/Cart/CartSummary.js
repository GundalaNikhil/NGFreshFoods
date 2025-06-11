import React from "react";
import { Text, View } from "react-native";
import { Receipt, Tag, Gift } from "lucide-react-native";

const CartSummary = ({ subtotal, discount, promoDiscount }) => {
  const total = subtotal - promoDiscount;

  return (
    <View className="p-4">
      <View className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50">
        <View className="flex-row items-center mb-4">
          <Receipt size={20} color="#059669" />
          <Text className="text-lg font-bold text-gray-900 ml-2">
            Price Details
          </Text>
        </View>

        <View className="h-px bg-gray-200 my-3" />

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 font-medium">Subtotal</Text>
          <Text className="text-base text-gray-900 font-semibold">
            ₹{subtotal.toFixed(2)}
          </Text>
        </View>

        {promoDiscount > 0 && (
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Gift size={16} color="#8b5cf6" />
              <Text className="text-base text-purple-500 font-medium ml-1.5">
                Promo Discount
              </Text>
            </View>
            <Text className="text-base text-purple-500 font-semibold">
              -₹{promoDiscount.toFixed(2)}
            </Text>
          </View>
        )}

        <View className="h-px bg-gray-200 my-3" />

        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-lg font-bold text-gray-900">Total</Text>
          <Text className="text-xl font-black text-emerald-600">
            ₹{total.toFixed(2)}
          </Text>
        </View>

        {(discount > 0 || promoDiscount > 0) && (
          <View className="bg-emerald-50 p-3 rounded-lg mt-4 items-center">
            <Text className="text-sm text-emerald-600 font-semibold">
              You saved ₹{(discount + promoDiscount).toFixed(2)} on this order!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default CartSummary;

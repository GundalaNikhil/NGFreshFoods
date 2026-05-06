import { ReceiptText, ShieldCheck, Lock, Clock } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const CartSummary = ({
  subtotal,
  discount,
  promoDiscount,
  selectedOffer,
  deliveryFee = 0,
  taxRate = 0,
}) => {
  const netAmount = subtotal - promoDiscount + deliveryFee;
  const taxes = netAmount * taxRate;
  const grandTotal = netAmount + taxes;

  return (
    <View className="p-4 pt-6">
      <View className="flex-row justify-between items-center mb-4 px-1">
        <Text className="text-[16px] font-bold text-gray-900">
          Bill Details
        </Text>
        <View className="flex-row items-center bg-orange-50 px-2 py-1 rounded-md">
          <Clock size={12} color="#EA580C" />
          <Text className="text-[10px] text-orange-600 font-bold ml-1 uppercase">High Demand</Text>
        </View>
      </View>
      
      <View className="bg-white rounded-2xl border border-gray-100 p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[14px] text-gray-600 font-medium">Item Total</Text>
          <Text className="text-[14px] text-gray-800 font-semibold">
            ₹{subtotal.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[14px] text-gray-600 font-medium">Delivery Partner Fee</Text>
          <Text className={`text-[14px] ${deliveryFee === 0 ? "text-green-600 font-bold" : "text-gray-800 font-semibold"}`}>
            {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
          </Text>
        </View>

        {taxes > 0 && (
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[14px] text-gray-600 font-medium">Taxes and Charges</Text>
            <Text className="text-[14px] text-gray-800 font-semibold">
              ₹{taxes.toFixed(2)}
            </Text>
          </View>
        )}

        <View className="h-[1px] bg-gray-50 my-2" />

        {promoDiscount > 0 && (
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[14px] text-green-600 font-bold uppercase">Coupon Savings</Text>
            <Text className="text-[14px] text-green-600 font-bold">
              -₹{promoDiscount.toFixed(2)}
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-[16px] font-black text-gray-900">Grand Total</Text>
          <Text className="text-[16px] font-black text-gray-900">
            ₹{grandTotal.toFixed(2)}
          </Text>
        </View>
      </View>

      {(discount > 0 || promoDiscount > 0) && (
        <View className="mx-1 mt-4 flex-row items-center border border-green-100 bg-green-50/30 p-3 rounded-xl">
          <Text className="text-[12px] text-green-700 font-bold tracking-tight">
            SAVED ₹{(discount + promoDiscount).toFixed(2)} WITH COUPONS & OFFERS
          </Text>
        </View>
      )}

      {/* Trust and Security Badges */}
      <View className="flex-row items-center justify-center mt-6 bg-gray-50 p-3 rounded-xl">
        <View className="flex-row items-center mr-5">
          <ShieldCheck size={16} color="#059669" />
          <Text className="text-[11px] text-gray-600 font-bold ml-1">Quality Assured</Text>
        </View>
        <View className="flex-row items-center">
          <Lock size={16} color="#059669" />
          <Text className="text-[11px] text-gray-600 font-bold ml-1">100% Secure Payment</Text>
        </View>
      </View>
    </View>
  );
};

export default CartSummary;

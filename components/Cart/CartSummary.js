import { ReceiptText } from "lucide-react-native";
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
      <Text className="text-[16px] font-bold text-gray-900 mb-4 px-1">
        Bill Details
      </Text>
      
      <View className="bg-white rounded-2xl border border-gray-100 p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[14px] text-gray-600 font-medium">Item Total</Text>
          <Text className="text-[14px] text-gray-800 font-semibold">
            ₹{subtotal.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[14px] text-gray-600 font-medium">Delivery Partner Fee</Text>
          <Text className="text-[14px] text-gray-800 font-semibold">
            ₹{deliveryFee.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[14px] text-gray-600 font-medium">Taxes and Charges</Text>
          <Text className="text-[14px] text-gray-800 font-semibold">
            ₹{taxes.toFixed(2)}
          </Text>
        </View>

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
    </View>
  );
};

export default CartSummary;

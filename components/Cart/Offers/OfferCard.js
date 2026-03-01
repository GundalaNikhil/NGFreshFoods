import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Tag, Gift, Check, AlertCircle } from "lucide-react-native";

const OfferCard = ({ offer, isSelected, onSelect, cartTotal }) => {
  const getOfferDiscount = (offer, total) => {
    if (!offer) return 0;
    if (offer.discountType === "PERCENTAGE") {
      const percentValue = Number(offer.discountValue || 0);
      const raw = (total * percentValue) / 100;
      if (offer.maxDiscountAmount) {
        return Math.min(raw, Number(offer.maxDiscountAmount));
      }
      return raw;
    }
    const flat = Number(offer.discountValue || 0);
    if (offer.maxDiscountAmount) {
      return Math.min(flat, Number(offer.maxDiscountAmount));
    }
    return flat;
  };

  const isEligible = (offer, total) => {
    const minAmount = Number(offer.minOrderAmount || 0);
    return total >= minAmount;
  };

  const discount = getOfferDiscount(offer, cartTotal);
  const eligible = isEligible(offer, cartTotal);

  return (
    <TouchableOpacity
      onPress={eligible ? onSelect : null}
      className={`mb-4 rounded-3xl p-6 border ${
        isSelected
          ? "border-emerald-500 bg-emerald-50/50"
          : eligible
          ? "border-gray-200 bg-white"
          : "border-gray-100 bg-gray-50"
      } ${eligible ? "shadow-md shadow-emerald-900/5" : ""}`}
      disabled={!eligible}
      activeOpacity={0.85}
    >
      <View className="flex-row items-start">
        <View className="w-12 h-12 rounded-2xl bg-emerald-100 items-center justify-center mr-4">
           {eligible ? (
              <Tag size={24} color="#059669" />
            ) : (
              <AlertCircle size={24} color="#94A3B8" />
            )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className={`font-black text-lg tracking-tight ${
                isSelected
                  ? "text-emerald-800"
                  : eligible
                  ? "text-gray-900"
                  : "text-gray-400"
              }`}
            >
              {offer.code || offer.promoCode}
            </Text>
            {isSelected && (
              <View className="bg-emerald-500 p-1 rounded-full">
                <Check size={12} color="white" strokeWidth={4} />
              </View>
            )}
          </View>
          
          <Text
            className={`text-[15px] font-bold mb-1 ${
              eligible ? "text-gray-800" : "text-gray-400"
            }`}
          >
            {offer.title || "Special Discount"}
          </Text>

          <Text
            className={`text-[13px] leading-relaxed mb-4 ${
              eligible ? "text-gray-500 font-medium" : "text-gray-400"
            }`}
          >
            {offer.description || `Save big on your order today!`}
          </Text>

          <View className="flex-row items-center justify-between">
            {eligible ? (
               <View className="bg-emerald-600 px-3 py-1 rounded-full">
                <Text className="text-white font-black text-[11px] uppercase tracking-wider">
                  Save ₹{discount.toFixed(0)}
                </Text>
              </View>
            ) : (
              <View className="bg-gray-200 px-3 py-1 rounded-full">
                 <Text className="text-gray-500 font-bold text-[10px] uppercase">
                  Locked
                </Text>
              </View>
            )}

            {!eligible && (
              <Text className="text-gray-400 font-bold text-[11px]">
                Add ₹{Number((offer.minOrderAmount || 0) - cartTotal).toFixed(0)} more
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OfferCard;

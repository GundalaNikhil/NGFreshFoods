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
          ? "border-[#E23744] bg-[#FFF0F1]"
          : eligible
          ? "border-[#E9E9EB] bg-white"
          : "border-[#F5F5F5] bg-[#F5F5F5]"
      } ${eligible ? "shadow-md shadow-[#E23744]/5" : ""}`}
      disabled={!eligible}
      activeOpacity={0.85}
    >
      <View className="flex-row items-start">
        <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${eligible ? "bg-[#FFF0F1]" : "bg-[#F5F5F5]"}`}>
           {eligible ? (
              <Tag size={24} color="#E23744" />
            ) : (
              <AlertCircle size={24} color="#93959F" />
            )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className={`font-black text-lg tracking-tight ${
                isSelected
                  ? "text-[#E23744]"
                  : eligible
                  ? "text-[#1C1C1C]"
                  : "text-[#93959F]"
              }`}
            >
              {offer.code || offer.promoCode}
            </Text>
            {isSelected && (
              <View className="bg-[#E23744] p-1 rounded-full">
                <Check size={12} color="white" strokeWidth={4} />
              </View>
            )}
          </View>
          
          <Text
            className={`text-[15px] font-bold mb-1 ${
              eligible ? "text-[#1C1C1C]" : "text-[#93959F]"
            }`}
          >
            {offer.title || "Special Discount"}
          </Text>

          <Text
            className={`text-[13px] leading-relaxed mb-4 ${
              eligible ? "text-[#686B78] font-medium" : "text-[#93959F]"
            }`}
          >
            {offer.description || `Save big on your order today!`}
          </Text>

          <View className="flex-row items-center justify-between">
            {eligible ? (
               <View className="bg-[#E23744] px-3 py-1 rounded-full">
                <Text className="text-white font-black text-[11px] uppercase tracking-wider">
                  Save ₹{discount.toFixed(0)}
                </Text>
              </View>
            ) : (
              <View className="bg-[#E9E9EB] px-3 py-1 rounded-full">
                 <Text className="text-[#686B78] font-bold text-[10px] uppercase">
                  Locked
                </Text>
              </View>
            )}

            {!eligible && (
              <Text className="text-[#93959F] font-bold text-[11px]">
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

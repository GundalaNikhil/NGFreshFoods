import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Tag, Gift, Check, AlertCircle } from "lucide-react-native";

const OfferCard = ({ offer, isSelected, onSelect, cartTotal }) => {
  const getOfferDiscount = (offer, total) => {
    switch (offer.promoCode) {
      case "WELCOME50":
        return Math.min(total * 0.5, 500);
      case "WEEKENDfeast":
        return Math.min(total * 0.2, 500);
      case "SAVE300NOW":
        return total >= 1000 ? 300 : 0;
      case "BULKBUY10":
        return total * 0.1;
      case "HOLIDAY15":
        return total * 0.15;
      default:
        return 0;
    }
  };

  const isEligible = (offer, total) => {
    switch (offer.promoCode) {
      case "SAVE300NOW":
        return total >= 1000;
      default:
        return true;
    }
  };

  const discount = getOfferDiscount(offer, cartTotal);
  const eligible = isEligible(offer, cartTotal);

  return (
    <TouchableOpacity
      onPress={eligible ? onSelect : null}
      className={`mb-4 rounded-2xl p-5 border-2 ${
        isSelected
          ? "border-emerald-500 bg-emerald-50"
          : eligible
          ? "border-gray-200 bg-white"
          : "border-gray-200 bg-gray-50"
      } ${eligible ? "shadow-lg shadow-gray-200/50" : ""}`}
      disabled={!eligible}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            {eligible ? (
              <Tag size={18} color={isSelected ? "#059669" : "#6b7280"} />
            ) : (
              <AlertCircle size={18} color="#ef4444" />
            )}
            <Text
              className={`font-bold text-lg ml-2 ${
                isSelected
                  ? "text-emerald-700"
                  : eligible
                  ? "text-gray-900"
                  : "text-gray-400"
              }`}
            >
              {offer.title}
            </Text>
          </View>
          
          <Text
            className={`text-sm mb-3 ${
              eligible ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {offer.description}
          </Text>

          <View className="flex-row items-center justify-between">
            <View
              className={`px-3 py-1.5 rounded-lg ${
                isSelected
                  ? "bg-emerald-200"
                  : eligible
                  ? "bg-gray-100"
                  : "bg-gray-200"
              }`}
            >
              <Text
                className={`font-bold text-xs ${
                  isSelected
                    ? "text-emerald-800"
                    : eligible
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {offer.promoCode}
              </Text>
            </View>

            {eligible && discount > 0 && (
              <Text className="text-emerald-600 font-bold text-sm">
                Save ₹{discount.toFixed(0)}
              </Text>
            )}

            {!eligible && (
              <Text className="text-red-500 font-medium text-xs">
                Minimum ₹1000 required
              </Text>
            )}
          </View>
        </View>

        {isSelected && (
          <View className="bg-emerald-500 p-2 rounded-full ml-3">
            <Check size={16} color="white" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default OfferCard;
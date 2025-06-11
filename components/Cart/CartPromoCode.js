import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Tag, Gift } from "lucide-react-native";

const PROMO_CODES = {
  WELCOME50: 50,
  SAVE100: 100,
  FRESH20: 20,
};

const CartPromoCode = ({ onApplyPromo, onShowOffers, selectedOffer }) => {
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [appliedCode, setAppliedCode] = useState("");

  const handleApplyPromo = () => {
    const discount = PROMO_CODES[promoCode.toUpperCase()];
    if (discount) {
      setError("");
      setAppliedCode(promoCode.toUpperCase());
      onApplyPromo(discount);
    } else {
      setError("Invalid promo code");
      setAppliedCode("");
      onApplyPromo(0);
    }
  };

  return (
    <View className="bg-white mx-4 rounded-2xl p-5 mb-4 shadow-lg shadow-gray-200/50">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Tag size={20} color="#059669" />
          <Text className="font-bold text-lg ml-2 text-gray-900">
            Apply Promo Code
          </Text>
        </View>
        <TouchableOpacity
          onPress={onShowOffers}
          className="bg-emerald-100 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-emerald-600 font-semibold text-sm">
            View Offers
          </Text>
        </TouchableOpacity>
      </View>

      {selectedOffer && (
        <View className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg mb-4 border border-purple-200">
          <View className="flex-row items-center">
            <Gift size={16} color="#8b5cf6" />
            <Text className="text-purple-700 font-semibold ml-2 flex-1">
              {selectedOffer.title}
            </Text>
          </View>
          <Text className="text-purple-600 text-sm mt-1 ml-6">
            {selectedOffer.description}
          </Text>
          <Text className="text-purple-800 font-bold text-xs mt-1 ml-6">
            Code: {selectedOffer.promoCode}
          </Text>
        </View>
      )}

      <View className="flex-row">
        <TextInput
          value={promoCode}
          onChangeText={setPromoCode}
          placeholder="Enter promo code"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 mr-3 bg-gray-50"
          autoCapitalize="characters"
        />
        <TouchableOpacity
          onPress={handleApplyPromo}
          className="bg-emerald-600 px-6 py-3 rounded-lg shadow-lg shadow-emerald-600/30"
        >
          <Text className="text-white font-bold">Apply</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text className="text-red-500 mt-3 font-medium">{error}</Text>
      ) : appliedCode ? (
        <Text className="text-emerald-600 mt-3 font-medium">
          Promo code {appliedCode} applied successfully!
        </Text>
      ) : null}
    </View>
  );
};

export default CartPromoCode;

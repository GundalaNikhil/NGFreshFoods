// components/Cart/CartPromoCode.jsx
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const PROMO_CODES = {
  WELCOME50: 50,
  SAVE100: 100,
  FRESH20: 20,
};

const CartPromoCode = ({ onApplyPromo }) => {
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
    <View className="bg-white p-4 mb-4">
      <Text className="font-bold text-lg mb-2">Apply Promo Code</Text>

      <View className="flex-row">
        <TextInput
          value={promoCode}
          onChangeText={setPromoCode}
          placeholder="Enter promo code"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 mr-2"
          autoCapitalize="characters"
        />

        <TouchableOpacity
          onPress={handleApplyPromo}
          className="bg-black px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-bold">Apply</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text className="text-red-500 mt-2">{error}</Text>
      ) : appliedCode ? (
        <Text className="text-green-500 mt-2">
          Promo code {appliedCode} applied successfully!
        </Text>
      ) : null}
    </View>
  );
};

export default CartPromoCode;

import React, { useState, useEffect } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Tag, Gift, X } from "lucide-react-native";

const PROMO_CODES = {
  WELCOME50: 50,
  SAVE100: 100,
  FRESH20: 20,
};

const CartPromoCode = ({
  onApplyPromo,
  onShowOffers,
  selectedOffer,
  promoCode: appliedPromoCode,
  discountAmount,
  onRemovePromo,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Clear messages when promo code input changes
  useEffect(() => {
    if (promoCode) {
      setError("");
      setSuccess("");
    }
  }, [promoCode]);

  // Clear input when offer is applied/removed
  useEffect(() => {
    if (selectedOffer || appliedPromoCode) {
      setPromoCode("");
      setError("");
    }
  }, [selectedOffer, appliedPromoCode]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-clear error message after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const hasActivePromo = !!(selectedOffer || appliedPromoCode);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setError("Please enter a promo code");
      return;
    }

    const discount = PROMO_CODES[promoCode.toUpperCase()];
    if (discount) {
      setError("");
      setSuccess(`Promo code ${promoCode.toUpperCase()} applied successfully!`);
      onApplyPromo({ promoCode: promoCode.toUpperCase(), discount });
      setPromoCode("");
    } else {
      setError("Invalid promo code. Please try again.");
      setSuccess("");
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setError("");
    setSuccess("");
    onRemovePromo();
  };

  const handleShowOffers = () => {
    if (!hasActivePromo) {
      onShowOffers();
    }
  };

  return (
    <View className="bg-white mx-4 rounded-2xl p-5 mb-4 shadow-lg shadow-gray-200/50">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Tag size={20} color="#059669" />
          <Text className="font-bold text-lg ml-2 text-gray-900">
            Promo Code & Offers
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleShowOffers}
          className={`px-3 py-1.5 rounded-lg ${
            hasActivePromo ? "bg-gray-200" : "bg-emerald-100"
          }`}
          disabled={hasActivePromo}
        >
          <Text
            className={`font-semibold text-sm ${
              hasActivePromo ? "text-gray-400" : "text-emerald-600"
            }`}
          >
            View Offers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Offer Banner */}
      {selectedOffer && (
        <View className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl mb-4 border border-purple-200">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1">
              <Gift size={18} color="#8b5cf6" />
              <Text className="text-purple-700 font-bold ml-2 text-base">
                {selectedOffer.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleRemovePromo}
              className="bg-red-100 p-1.5 rounded-full"
            >
              <X size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>
          <Text className="text-purple-600 text-sm ml-6 mb-1">
            {selectedOffer.description}
          </Text>
          <Text className="text-purple-800 font-semibold text-xs ml-6">
            Code: {selectedOffer.promoCode}
          </Text>
          <Text className="text-emerald-600 font-bold text-sm ml-6 mt-1">
            Discount: ₹{discountAmount}
          </Text>
        </View>
      )}

      {/* Applied Promo Code Banner */}
      {appliedPromoCode && !selectedOffer && (
        <View className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl mb-4 border border-emerald-200">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center flex-1">
              <Tag size={18} color="#059669" />
              <Text className="text-emerald-700 font-bold ml-2 text-base">
                Promo Code Applied
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleRemovePromo}
              className="bg-red-100 p-1.5 rounded-full"
            >
              <X size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>
          <Text className="text-emerald-600 font-semibold text-sm ml-6">
            Code: {appliedPromoCode}
          </Text>
          <Text className="text-emerald-600 font-bold text-sm ml-6 mt-1">
            Discount: ₹{discountAmount}
          </Text>
        </View>
      )}

      {/* Promo Code Input Section */}
      {!hasActivePromo && (
        <>
          <View className="flex-row items-center">
            <TextInput
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Enter promo code"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 mr-3 bg-gray-50 text-gray-900"
              autoCapitalize="characters"
              autoCorrect={false}
              onSubmitEditing={handleApplyPromo}
            />
            <TouchableOpacity
              onPress={handleApplyPromo}
              className="px-6 py-3 rounded-lg bg-emerald-600 shadow-lg shadow-emerald-600/30"
              disabled={!promoCode.trim()}
            >
              <Text className="text-white font-bold">Apply</Text>
            </TouchableOpacity>
          </View>

          {/* Feedback Messages */}
          {error && (
            <View className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <Text className="text-red-600 font-medium text-sm">{error}</Text>
            </View>
          )}

          {success && (
            <View className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <Text className="text-emerald-600 font-medium text-sm">
                {success}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Disabled State Message */}
      {hasActivePromo && (
        <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <Text className="text-gray-500 text-sm text-center font-medium">
            {selectedOffer
              ? "Remove current offer to apply a promo code"
              : "Remove current promo code to select an offer"}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CartPromoCode;

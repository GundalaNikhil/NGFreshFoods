import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Tag, Gift, ChevronRight } from "lucide-react-native";

const CartPromoCode = ({
  onApplyPromo,
  onShowOffers,
  selectedOffer,
  promoCode: appliedPromoCode,
  discountAmount,
  onRemovePromo,
  cartTotal,
  availableCoupons = [],
  couponsLoading = false,
  isApplying = false,
  couponsError = "",
  onReloadCoupons,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasActivePromo = !!(selectedOffer || appliedPromoCode);

  useEffect(() => {
    if (promoCode) {
      setError("");
      setSuccess("");
    }
  }, [promoCode]);

  useEffect(() => {
    if (selectedOffer || appliedPromoCode) {
      setPromoCode("");
      setError("");
      setShowSuggestions(false);
    }
  }, [selectedOffer, appliedPromoCode]);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    onApplyPromo({ promoCode: promoCode.toUpperCase() }).then((result) => {
      setLoading(false);
      if (result?.ok) {
        setError("");
        setSuccess(
          `${result.coupon?.title || "Coupon"} applied! You saved ₹${Number(
            result.discount || 0
          ).toFixed(2)}`
        );
        setPromoCode("");
        setShowSuggestions(false);
      } else {
        setError(result?.message || "Invalid coupon");
        setSuccess("");
      }
    });
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setError("");
    setSuccess("");
    setShowSuggestions(false);
    onRemovePromo();
  };

  const handleShowOffers = () => {
    onShowOffers();
  };

  const handleInputFocus = () => {
    if (!hasActivePromo && availableCoupons.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionSelect = (coupon) => {
    setPromoCode(coupon.code);
    setShowSuggestions(false);
    setTimeout(() => handleApplyPromo(), 100);
  };

  const eligibleCoupons = availableCoupons.filter((coupon) => {
    const minAmount = Number(coupon.minOrderAmount || 0);
    return cartTotal >= minAmount;
  });

  return (
    <View className="px-4 py-2 mt-2">
      <TouchableOpacity
        onPress={handleShowOffers}
        className="flex-row items-center justify-between bg-white border border-gray-100 p-4 rounded-xl shadow-sm"
      >
        <View className="flex-row items-center">
          <Tag size={20} color="#16A34A" />
          <Text className="font-bold text-[15px] ml-3 text-gray-800">
            Use coupons to save more
          </Text>
        </View>
        <ChevronRight size={20} color="#16A34A" />
      </TouchableOpacity>

      {selectedOffer && (
        <View className="bg-green-50 p-4 rounded-xl mt-3 border border-green-100">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center flex-1">
              <Gift size={18} color="#16A34A" />
              <Text className="text-green-700 font-bold ml-2 text-sm">
                '{selectedOffer.code || selectedOffer.promoCode}' applied!
              </Text>
            </View>
            <TouchableOpacity onPress={handleRemovePromo}>
              <Text className="text-green-600 font-bold text-xs uppercase">
                Remove
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 text-[11px] ml-7">
            You are saving ₹{Number(discountAmount || 0).toFixed(2)} on this
            order
          </Text>
        </View>
      )}

      {!hasActivePromo && (
        <View className="mt-4">
          <View className="flex-row items-center">
            <TextInput
              value={promoCode}
              onChangeText={setPromoCode}
              onFocus={handleInputFocus}
              placeholder="Type coupon code here..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-[14px] font-medium"
              autoCapitalize="characters"
            />
            <TouchableOpacity
              onPress={handleApplyPromo}
              disabled={!promoCode.trim() || loading || isApplying}
              className="ml-3"
            >
              {loading || isApplying ? (
                <ActivityIndicator size="small" color="#16A34A" />
              ) : (
                <Text
                  className={`font-bold text-[14px] ${
                    promoCode.trim() ? "text-green-600" : "text-gray-300"
                  }`}
                >
                  APPLY
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {showSuggestions && eligibleCoupons.length > 0 && (
            <View className="mt-3 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <ScrollView style={{ maxHeight: 160 }}>
                {eligibleCoupons.map((coupon) => (
                  <TouchableOpacity
                    key={coupon.code}
                    onPress={() => handleSuggestionSelect(coupon)}
                    className="px-4 py-3 border-b border-gray-50"
                  >
                    <Text className="text-[13px] font-bold text-gray-800">
                      {coupon.code}
                    </Text>
                    {coupon.title || coupon.description ? (
                      <Text className="text-[11px] text-gray-500">
                        {coupon.title || coupon.description}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {couponsLoading ? (
            <Text className="text-[11px] text-gray-400 mt-3">
              Loading coupons...
            </Text>
          ) : null}
          {couponsError ? (
            <TouchableOpacity onPress={onReloadCoupons} className="mt-3">
              <Text className="text-[11px] text-red-600">
                {couponsError} Tap to retry.
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {error ? (
        <Text className="text-red-500 text-xs mt-2 px-1">{error}</Text>
      ) : success ? (
        <Text className="text-green-600 text-xs mt-2 px-1">{success}</Text>
      ) : null}
    </View>
  );
};

export default CartPromoCode;

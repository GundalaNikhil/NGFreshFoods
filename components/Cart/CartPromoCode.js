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

  const applyCode = (code) => {
    if (!code.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    onApplyPromo({ promoCode: code.toUpperCase() }).then((result) => {
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

  const handleApplyPromo = () => {
    applyCode(promoCode);
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
    // Call applyCode directly with the code — avoids stale closure on promoCode state
    applyCode(coupon.code);
  };

  const eligibleCoupons = availableCoupons.filter((coupon) => {
    const minAmount = Number(coupon.minOrderAmount || 0);
    return cartTotal >= minAmount;
  });

  return (
    <View className="px-4 py-2 mt-2">
      <TouchableOpacity
        onPress={handleShowOffers}
        className="flex-row items-center justify-between bg-white border border-[#E9E9EB] p-4 rounded-xl"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
      >
        <View className="flex-row items-center">
          <Tag size={20} color="#E23744" />
          <Text className="font-bold text-[15px] ml-3 text-[#1C1C1C]">
            Use coupons to save more
          </Text>
        </View>
        <ChevronRight size={20} color="#E23744" />
      </TouchableOpacity>

      {selectedOffer && (
        <View className="bg-[#F0FFF4] p-4 rounded-xl mt-3 border border-[#BBF7D0]">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center flex-1">
              <Gift size={18} color="#60B246" />
              <Text className="text-[#15803D] font-bold ml-2 text-sm">
                '{selectedOffer.code || selectedOffer.promoCode}' applied!
              </Text>
            </View>
            <TouchableOpacity onPress={handleRemovePromo}>
              <Text className="text-[#E23744] font-bold text-xs uppercase">
                Remove
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-[#686B78] text-[11px] ml-7">
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
              className="flex-1 border border-[#E9E9EB] rounded-lg px-4 py-3 bg-[#F5F5F5] text-[14px] font-medium"
              autoCapitalize="characters"
            />
            <TouchableOpacity
              onPress={handleApplyPromo}
              disabled={!promoCode.trim() || loading || isApplying}
              style={{ width: 60, alignItems: "center", justifyContent: "center" }}
              className="ml-3"
            >
              {loading || isApplying ? (
                <ActivityIndicator size="small" color="#E23744" />
              ) : (
                <Text
                  className={`font-bold text-[14px] ${
                    promoCode.trim() ? "text-[#E23744]" : "text-[#D5D5D8]"
                  }`}
                >
                  APPLY
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {showSuggestions && eligibleCoupons.length > 0 && (
            <View className="mt-3 bg-white border border-[#E9E9EB] rounded-xl overflow-hidden" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
              <ScrollView style={{ maxHeight: 160 }}>
                {eligibleCoupons.map((coupon) => (
                  <TouchableOpacity
                    key={coupon.code}
                    onPress={() => handleSuggestionSelect(coupon)}
                    className="px-4 py-3 border-b border-[#F5F5F5]"
                  >
                    <Text className="text-[13px] font-bold text-[#1C1C1C]">
                      {coupon.code}
                    </Text>
                    {coupon.title || coupon.description ? (
                      <Text className="text-[11px] text-[#93959F]">
                        {coupon.title || coupon.description}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {couponsLoading ? (
            <View className="items-center justify-center py-6">
              <ActivityIndicator size="large" color="#E23744" />
              <Text className="text-[12px] text-[#93959F] mt-2 font-medium">
                Loading coupons...
              </Text>
            </View>
          ) : null}
          {couponsError ? (
            <TouchableOpacity onPress={onReloadCoupons} className="mt-3">
              <Text className="text-[11px] text-[#E23744]">
                {couponsError} Tap to retry.
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {error ? (
        <Text className="text-[#E23744] text-xs mt-2 px-1">{error}</Text>
      ) : success ? (
        <Text className="text-[#60B246] text-xs mt-2 px-1">{success}</Text>
      ) : null}
    </View>
  );
};

export default CartPromoCode;

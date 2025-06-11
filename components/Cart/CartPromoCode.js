import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import {
  Tag,
  Gift,
  X,
  Info,
  CheckCircle,
  AlertTriangle,
} from "lucide-react-native";
import {
  validatePromoCode,
  getAvailablePromoCodes,
  calculateChickenWeight,
} from "../../utils/promoHelper";

const CartPromoCode = ({
  onApplyPromo,
  onShowOffers,
  selectedOffer,
  promoCode: appliedPromoCode,
  discountAmount,
  onRemovePromo,
  cartItems,
  userProfile,
  cartTotal,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [availablePromoCodes, setAvailablePromoCodes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update available promo codes when cart changes
  useEffect(() => {
    const available = getAvailablePromoCodes(cartItems, userProfile);
    setAvailablePromoCodes(available);
  }, [cartItems, userProfile]);

  // **NEW: Check if current applied promo is still valid**
  useEffect(() => {
    if (
      (selectedOffer?.promoCode || appliedPromoCode) &&
      Object.keys(cartItems).length > 0
    ) {
      const currentPromoCode = selectedOffer?.promoCode || appliedPromoCode;
      const validation = validatePromoCode(
        currentPromoCode,
        cartItems,
        userProfile,
        cartTotal
      );

      if (!validation.isValid) {
        setWarning(
          `${currentPromoCode} may be removed as cart conditions changed`
        );
        // Clear other messages
        setError("");
        setSuccess("");
      } else {
        setWarning("");
      }
    } else {
      setWarning("");
    }
  }, [cartItems, cartTotal, selectedOffer, appliedPromoCode, userProfile]);

  // Clear messages when promo code input changes
  useEffect(() => {
    if (promoCode) {
      setError("");
      setSuccess("");
      setWarning("");
    }
  }, [promoCode]);

  // Clear input when offer is applied/removed
  useEffect(() => {
    if (selectedOffer || appliedPromoCode) {
      setPromoCode("");
      setError("");
      setShowSuggestions(false);
    }
  }, [selectedOffer, appliedPromoCode]);

  // Auto-clear success message after 4 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-clear error message after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-clear warning message after 6 seconds
  useEffect(() => {
    if (warning) {
      const timer = setTimeout(() => {
        setWarning("");
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [warning]);

  const hasActivePromo = !!(selectedOffer || appliedPromoCode);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setError("Please enter a promo code");
      return;
    }

    const validation = validatePromoCode(
      promoCode,
      cartItems,
      userProfile,
      cartTotal
    );

    if (validation.isValid) {
      setError("");
      setWarning("");
      setSuccess(
        `${validation.promo.title} applied successfully! You saved ₹${validation.discount}`
      );
      onApplyPromo({
        promoCode: promoCode.toUpperCase(),
        discount: validation.discount,
        promo: validation.promo,
      });
      setPromoCode("");
      setShowSuggestions(false);
    } else {
      setError(validation.errorMessage);
      setSuccess("");
      setWarning("");
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setError("");
    setSuccess("");
    setWarning("");
    setShowSuggestions(false);
    onRemovePromo();
  };

  const handleShowOffers = () => {
    if (!hasActivePromo) {
      onShowOffers();
    }
  };

  const handleInputFocus = () => {
    if (!hasActivePromo && availablePromoCodes.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionSelect = (promo) => {
    setPromoCode(promo.code);
    setShowSuggestions(false);
    // Auto-apply after selection
    setTimeout(() => {
      const validation = validatePromoCode(
        promo.code,
        cartItems,
        userProfile,
        cartTotal
      );
      if (validation.isValid) {
        onApplyPromo({
          promoCode: promo.code,
          discount: validation.discount,
          promo: validation.promo,
        });
        setSuccess(
          `${validation.promo.title} applied successfully! You saved ₹${validation.discount}`
        );
      }
    }, 100);
  };

  // Calculate cart insights
  const chickenWeight = calculateChickenWeight(cartItems);

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

      {/* Cart Insights */}
      {chickenWeight > 0 && (
        <View className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
          <View className="flex-row items-center">
            <Info size={16} color="#3b82f6" />
            <Text className="text-blue-700 font-medium ml-2 text-sm">
              You have {chickenWeight}kg chicken in cart
            </Text>
          </View>
          {chickenWeight >= 2 && (
            <Text className="text-blue-600 text-xs mt-1 ml-5">
              Eligible for premium chicken offers!
            </Text>
          )}
        </View>
      )}

      {/* **NEW: Warning for potentially invalid promo** */}
      {warning && (
        <View className="bg-yellow-50 p-3 rounded-lg mb-4 border border-yellow-200">
          <View className="flex-row items-center">
            <AlertTriangle size={16} color="#d97706" />
            <Text className="text-yellow-700 font-medium ml-2 text-sm">
              {warning}
            </Text>
          </View>
        </View>
      )}

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
              <CheckCircle size={18} color="#059669" />
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
              onFocus={handleInputFocus}
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

          {/* Available Promo Suggestions */}
          {showSuggestions && availablePromoCodes.length > 0 && (
            <View className="mt-3 bg-gray-50 rounded-lg border border-gray-200 max-h-40">
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-gray-600 font-semibold text-sm p-3 pb-1">
                  Available for your cart:
                </Text>
                {availablePromoCodes.map((promo, index) => (
                  <TouchableOpacity
                    key={promo.code}
                    onPress={() => handleSuggestionSelect(promo)}
                    className="px-3 py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="font-semibold text-emerald-600 text-sm">
                          {promo.code}
                        </Text>
                        <Text className="text-gray-600 text-xs mt-0.5">
                          {promo.description}
                        </Text>
                      </View>
                      <Tag size={14} color="#059669" />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

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

      {/* Tips Section */}
      {!hasActivePromo &&
        availablePromoCodes.length === 0 &&
        chickenWeight === 0 && (
          <View className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <Text className="text-yellow-700 font-medium text-sm">
              💡 Add chicken items to unlock special promo codes!
            </Text>
          </View>
        )}
    </View>
  );
};

export default CartPromoCode;

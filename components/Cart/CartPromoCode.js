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
  ChevronRight,
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
    <View className="px-4 py-2 mt-2">
      <TouchableOpacity 
        onPress={handleShowOffers}
        className="flex-row items-center justify-between bg-white border border-gray-100 p-4 rounded-xl shadow-sm"
      >
        <View className="flex-row items-center">
          <Tag size={20} color="#E23744" />
          <Text className="font-bold text-[15px] ml-3 text-gray-800">
            Use coupons to save more
          </Text>
        </View>
        <ChevronRight size={20} color="#E23744" />
      </TouchableOpacity>

      {/* Active Offer Banner */}
      {selectedOffer && (
        <View className="bg-red-50 p-4 rounded-xl mt-3 border border-red-100">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center flex-1">
              <Gift size={18} color="#E23744" />
              <Text className="text-red-700 font-bold ml-2 text-sm">
                '{selectedOffer.promoCode}' applied!
              </Text>
            </View>
            <TouchableOpacity onPress={handleRemovePromo}>
              <Text className="text-red-600 font-bold text-xs uppercase">Remove</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 text-[11px] ml-7">
            You are saving ₹{discountAmount} on this order
          </Text>
        </View>
      )}

      {/* Manual Input - Shown only if no promo applied */}
      {!hasActivePromo && (
        <View className="flex-row items-center mt-4">
          <TextInput
            value={promoCode}
            onChangeText={setPromoCode}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Type coupon code here..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-[14px] font-medium"
            autoCapitalize="characters"
          />
          <TouchableOpacity
            onPress={handleApplyPromo}
            disabled={!promoCode.trim()}
            className="ml-3"
          >
            <Text className={`font-bold text-[14px] ${promoCode.trim() ? "text-red-600" : "text-gray-300"}`}>
              APPLY
            </Text>
          </TouchableOpacity>
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

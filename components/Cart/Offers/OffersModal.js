import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { X, Gift, Tag, Check, Lock, Info } from "lucide-react-native";
import { OffersData } from "../../data/OffersData";
import OfferCard from "./OfferCard";
import {
  getEnabledOfferIds,
  calculateChickenWeight,
  isWeekend,
  isFirstTimeUser,
} from "../../../utils/promoHelper";

const { height: screenHeight } = Dimensions.get("window");

const OffersModal = ({
  visible,
  onClose,
  onSelectOffer,
  selectedOffer,
  cartTotal,
  cartItems = {},
  userProfile = {},
}) => {
  // Get all available offers
  const allOffers = OffersData.filter((offer) => offer.flag === true);

  // Get enabled offer IDs based on cart conditions
  const enabledOfferIds = getEnabledOfferIds(cartItems, userProfile, allOffers);

  // Separate enabled and disabled offers
  const enabledOffers = allOffers.filter((offer) =>
    enabledOfferIds.includes(offer.id)
  );
  const disabledOffers = allOffers.filter(
    (offer) => !enabledOfferIds.includes(offer.id)
  );

  // Calculate current cart conditions for display
  const chickenWeight = calculateChickenWeight(cartItems);
  const isWeekendNow = isWeekend();
  const isFirstTime = isFirstTimeUser(userProfile);

  const handleOfferSelect = (offer) => {
    // Only allow selection of enabled offers
    if (enabledOfferIds.includes(offer.id)) {
      onSelectOffer(offer);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const getDisabledReason = (offer) => {
    // Check specific conditions for why an offer might be disabled
    if (offer.promoCode === "WELCOME50" && !isFirstTime) {
      return "Only for first-time users";
    }
    if (
      (offer.promoCode === "B1G1FRESH" || offer.promoCode === "EGGSTRA4YOU") &&
      chickenWeight < 1
    ) {
      return `Add ${(1 - chickenWeight).toFixed(1)}kg more chicken`;
    }
    if (offer.promoCode === "DOUBLEDELIGHT" && chickenWeight < 2) {
      return `Add ${(2 - chickenWeight).toFixed(1)}kg more chicken`;
    }
    if (offer.promoCode === "WEEKENDFEAST" && !isWeekendNow) {
      return "Only available on weekends";
    }
    return "Conditions not met";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 pt-12 pb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Gift size={24} color="white" />
              <Text className="text-white text-xl font-bold ml-3">
                Available Offers
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="bg-white/20 p-2 rounded-full"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Cart Summary */}
          <View className="mt-3 bg-white/10 p-3 rounded-lg">
            <Text className="text-emerald-100 text-sm font-medium mb-1">
              Your Cart Summary:
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-white text-sm">
                🐔 Chicken: {chickenWeight}kg
              </Text>
              <Text className="text-white text-sm">
                {isWeekendNow ? "🎉 Weekend!" : "📅 Weekday"}
              </Text>
              <Text className="text-white text-sm">
                {isFirstTime ? "🆕 First Timer" : "👋 Welcome Back"}
              </Text>
            </View>
          </View>

          {selectedOffer && (
            <View className="mt-2 bg-white/10 p-3 rounded-lg">
              <Text className="text-white text-sm font-medium">
                Current: {selectedOffer.title}
              </Text>
            </View>
          )}
        </View>

        {/* Offers List */}
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Enabled Offers */}
          {enabledOffers.length > 0 && (
            <>
              <View className="mb-4">
                <Text className="text-lg font-bold text-gray-800 mb-2">
                  Available Now ({enabledOffers.length})
                </Text>
                {enabledOffers.map((offer) => (
                  <TouchableOpacity
                    key={offer.id}
                    onPress={() => handleOfferSelect(offer)}
                    className="mb-3"
                  >
                    <OfferCard
                      offer={offer}
                      isSelected={selectedOffer?.id === offer.id}
                      onSelect={() => handleOfferSelect(offer)}
                      cartTotal={cartTotal}
                      isEnabled={true}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Disabled Offers */}
          {disabledOffers.length > 0 && (
            <>
              <View className="mb-4">
                <Text className="text-lg font-bold text-gray-500 mb-2">
                  Unlock More Offers ({disabledOffers.length})
                </Text>
                {disabledOffers.map((offer) => (
                  <View key={offer.id} className="mb-3 opacity-60">
                    <View className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center flex-1">
                          <Lock size={16} color="#9ca3af" />
                          <Text className="text-gray-600 font-bold ml-2 text-base">
                            {offer.title}
                          </Text>
                        </View>
                        <View className="bg-gray-200 px-2 py-1 rounded-full">
                          <Text className="text-gray-500 text-xs font-medium">
                            Locked
                          </Text>
                        </View>
                      </View>

                      <Text className="text-gray-500 text-sm mb-2">
                        {offer.description}
                      </Text>

                      <View className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                        <View className="flex-row items-center">
                          <Info size={14} color="#d97706" />
                          <Text className="text-yellow-700 text-xs font-medium ml-1">
                            {getDisabledReason(offer)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* No Offers Available */}
          {enabledOffers.length === 0 && disabledOffers.length === 0 && (
            <View className="flex-1 justify-center items-center py-20">
              <Gift size={48} color="#9ca3af" />
              <Text className="text-gray-500 text-lg font-medium mt-4">
                No offers available
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Check back later for exciting deals!
              </Text>
            </View>
          )}

          {/* Tips Section */}
          {enabledOffers.length === 0 && disabledOffers.length > 0 && (
            <View className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
              <Text className="text-blue-800 font-bold text-base mb-2">
                💡 Unlock More Savings!
              </Text>
              <View className="space-y-1">
                {chickenWeight < 1 && (
                  <Text className="text-blue-700 text-sm">
                    • Add {(1 - chickenWeight).toFixed(1)}kg chicken for special
                    offers
                  </Text>
                )}
                {chickenWeight >= 1 && chickenWeight < 2 && (
                  <Text className="text-blue-700 text-sm">
                    • Add {(2 - chickenWeight).toFixed(1)}kg more chicken for
                    premium offers
                  </Text>
                )}
                {!isWeekendNow && (
                  <Text className="text-blue-700 text-sm">
                    • Weekend offers available Saturday & Sunday
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <TouchableOpacity
            onPress={handleClose}
            className="bg-gray-600 py-4 rounded-xl"
          >
            <Text className="text-white text-center font-bold text-lg">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default OffersModal;

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { X, Gift, Info, Ticket } from "lucide-react-native";
import OfferCard from "./OfferCard";
import { Image } from "react-native";

const { height: screenHeight } = Dimensions.get("window");

const formatAmount = (value) => Number(value || 0).toFixed(2);

const OffersModal = ({
  visible,
  onClose,
  onSelectOffer,
  selectedOffer,
  cartTotal,
  offers = [],
  loading = false,
  isApplying = false,
  error = "",
  onReload,
}) => {
  const eligibleOffers = offers.filter((offer) => {
    const minAmount = Number(offer.minOrderAmount || 0);
    return cartTotal >= minAmount;
  });

  const ineligibleOffers = offers.filter((offer) => {
    const minAmount = Number(offer.minOrderAmount || 0);
    return cartTotal < minAmount;
  });

  const handleOfferSelect = (offer) => {
    onSelectOffer(offer);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="bg-emerald-600 px-6 pt-10 pb-8 rounded-b-[40px] shadow-lg">
          <View className="flex-row items-center justify-between mb-4">
            <View className="bg-white/20 p-2 rounded-xl">
              <Ticket size={24} color="white" />
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-black/10 p-2 rounded-full"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-white text-2xl font-black tracking-tight mb-1">
                Save & Feast!
              </Text>
              <Text className="text-emerald-50 text-sm font-medium leading-tight">
                Get the best deals on your fresh farm favorites.
              </Text>
              
            </View>
            
            <Image 
              source={require("../../../assets/images/characters/offers/main_no_bg.png")}
              style={{ width: 130, height: 130, marginRight: -24 }}
              resizeMode="contain"
            />
          </View>
        </View>

        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {loading ? (
            <View className="flex-1 items-center justify-center p-20">
              <ActivityIndicator size="large" color="#107A4A" />
              <Text className="text-gray-400 mt-4 font-medium text-center">
                Fetching the best deals for you...
              </Text>
            </View>
          ) : error ? (
            <TouchableOpacity onPress={onReload} className="bg-red-50 p-3 rounded-xl">
              <Text className="text-red-600 text-sm">{error} Tap to retry.</Text>
            </TouchableOpacity>
          ) : (
            <>
              {eligibleOffers.length > 0 && (
                <View className="mb-4">
                  <Text className="text-lg font-bold text-gray-800 mb-2">
                    Available Now ({eligibleOffers.length})
                  </Text>
                  {eligibleOffers.map((offer) => (
                    <TouchableOpacity
                      key={offer.couponId || offer.code}
                      onPress={() => handleOfferSelect(offer)}
                      className="mb-3"
                    >
                      <OfferCard
                        offer={offer}
                        isSelected={selectedOffer?.couponId === offer.couponId}
                        onSelect={() => {
                          if (selectedOffer?.couponId === offer.couponId) return;
                          handleOfferSelect(offer);
                        }}
                        cartTotal={cartTotal}
                        isEnabled={selectedOffer?.couponId !== offer.couponId}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {ineligibleOffers.length > 0 && (
                <View className="mb-4">
                  <Text className="text-lg font-bold text-gray-500 mb-2">
                    Unlock More ({ineligibleOffers.length})
                  </Text>
                  {ineligibleOffers.map((offer) => (
                    <View key={offer.couponId || offer.code} className="mb-3 opacity-60">
                      <View className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center flex-1">
                            <Info size={16} color="#9ca3af" />
                            <Text className="text-gray-600 font-bold ml-2 text-base">
                              {offer.title || offer.code}
                            </Text>
                          </View>
                          <View className="bg-gray-200 px-2 py-1 rounded-full">
                            <Text className="text-gray-500 text-xs font-medium">
                              Locked
                            </Text>
                          </View>
                        </View>
                        <Text className="text-gray-500 text-sm mb-2">
                          {offer.description || offer.code}
                        </Text>
                        <View className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                          <View className="flex-row items-center">
                            <Info size={14} color="#d97706" />
                            <Text className="text-yellow-700 text-xs font-medium ml-1">
                              Add ₹{formatAmount(offer.minOrderAmount - cartTotal)} more to unlock
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
        {isApplying && (
          <View className="absolute inset-0 bg-white/60 items-center justify-center z-50">
            <View className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 items-center">
              <ActivityIndicator size="large" color="#107A4A" />
              <Text className="text-emerald-900 font-bold mt-4 text-base">Applying Coupon...</Text>
              <Text className="text-gray-500 text-xs mt-1">Checking for the best savings</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default OffersModal;

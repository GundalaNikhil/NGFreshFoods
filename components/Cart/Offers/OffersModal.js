import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { X, Gift, Tag, Check } from "lucide-react-native";
import { OffersData } from "../../data/OffersData";
import OfferCard from "./OfferCard";

const { height: screenHeight } = Dimensions.get("window");

const OffersModal = ({
  visible,
  onClose,
  onSelectOffer,
  selectedOffer,
  cartTotal,
}) => {
  const availableOffers = OffersData.filter((offer) => offer.flag === true);

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
              onPress={onClose}
              className="bg-white/20 p-2 rounded-full"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-emerald-100 mt-2">
            Choose the best offer for your order
          </Text>
        </View>

        {/* Offers List */}
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {availableOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              isSelected={selectedOffer?.id === offer.id}
              onSelect={() => handleOfferSelect(offer)}
              cartTotal={cartTotal}
            />
          ))}
        </ScrollView>

        {/* Footer */}
        <View className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-600 py-4 rounded-xl"
          >
            <Text className="text-white text-center font-bold text-lg">
              {selectedOffer ? "Apply Selected Offer" : "Close"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default OffersModal;

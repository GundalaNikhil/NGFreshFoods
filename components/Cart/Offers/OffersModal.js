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
    onClose(); // Close modal after selection
  };

  const handleClose = () => {
    onClose();
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
          <Text className="text-emerald-100 mt-2">
            Choose the best offer for your order
          </Text>
          {selectedOffer && (
            <View className="mt-3 bg-white/10 p-3 rounded-lg">
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
          {availableOffers.length > 0 ? (
            availableOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                isSelected={selectedOffer?.id === offer.id}
                onSelect={() => handleOfferSelect(offer)}
                cartTotal={cartTotal}
              />
            ))
          ) : (
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

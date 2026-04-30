import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { X, Plus, Trash2, Home, Briefcase, Heart } from "lucide-react-native";
import { useAddress } from "../../hooks/useAddress";

const AddressSelectionSheet = ({ visible, onClose, onAddPress }) => {
  const { addresses, selectedAddressId, selectAddress, deleteAddress } = useAddress();

  const getIcon = (label) => {
    switch (label) {
      case "Home": return Home;
      case "Work": return Briefcase;
      default: return Heart;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>
        
        <View className="bg-white rounded-t-3xl pt-5 px-5 pb-10 max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-xl font-black text-[#1C1C1C]">Delivery Address</Text>
              <Text className="text-xs text-[#93959F] font-medium mt-0.5">Where should we drop off your order?</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1 w-8 h-8 rounded-full bg-[#F5F5F5] items-center justify-center">
              <X size={18} color="#686B78" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Address List */}
            {addresses.map((address) => {
              const IconComp = getIcon(address.label);
              const isSelected = selectedAddressId === address.addressId;

              return (
                <TouchableOpacity
                  key={address.addressId}
                  onPress={() => {
                    selectAddress(address.addressId);
                    onClose();
                  }}
                  className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
                    isSelected ? "border-[#E23744] bg-[#FFF0F1]" : "border-[#E9E9EB]"
                  }`}
                >
                  <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                    isSelected ? "bg-[#E23744]" : "bg-[#F5F5F5]"
                  }`}>
                    <IconComp size={20} color={isSelected ? "white" : "#686B78"} />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className={`text-[15px] font-black ${isSelected ? "text-[#1C1C1C]" : "text-[#686B78]"}`}>
                        {address.label || "Address"}
                      </Text>
                      {isSelected && (
                        <View className="ml-2 bg-[#E23744] px-2 py-0.5 rounded-full">
                          <Text className="text-[8px] text-white font-black uppercase">Selected</Text>
                        </View>
                      )}
                    </View>
                    <Text numberOfLines={1} className="text-xs text-[#93959F] mt-0.5 font-medium">
                      {address.addressLine1}
                    </Text>
                    <Text numberOfLines={1} className="text-[10px] text-[#93959F] mt-0.5">
                      {address.city} {address.postalCode ? `• ${address.postalCode}` : ""}
                    </Text>
                  </View>

                  <TouchableOpacity 
                    onPress={() => deleteAddress(address.addressId)}
                    className="p-2 ml-2"
                  >
                    <Trash2 size={16} color="#ef4444" strokeWidth={2} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}

            {/* Empty State / Add New */}
            <TouchableOpacity
              onPress={() => {
                onAddPress();
                onClose();
              }}
              className="flex-row items-center p-4 rounded-2xl border-2 border-dashed border-[#E9E9EB]"
            >
              <View className="w-10 h-10 rounded-xl bg-[#FFF0F1] items-center justify-center mr-4">
                <Plus size={20} color="#E23744" strokeWidth={2.5} />
              </View>
              <Text className="text-[15px] font-bold text-[#E23744]">Add New Address</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AddressSelectionSheet;

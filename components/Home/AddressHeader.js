import { ChevronDown, MapPin, User } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAddress } from "../../hooks/useAddress";

const AddressHeader = ({ onAddressPress, onProfilePress }) => {
  const { selectedAddress } = useAddress();

  return (
    <View className="flex-row items-center justify-between py-1">
      <TouchableOpacity 
        className="flex-row items-center flex-1 pr-3" 
        onPress={onAddressPress}
        activeOpacity={0.7}
      >
        <View className="w-9 h-9 rounded-full bg-[#FFF0F1] justify-center items-center">
          {selectedAddress ? (
            <MapPin size={17} color="#E23744" strokeWidth={2.5} />
          ) : (
            <MapPin size={17} color="#93959F" strokeWidth={2.5} />
          )}
        </View>

        <View className="ml-3 flex-1">
          {selectedAddress ? (
            <>
              <View className="flex-row items-center">
                <Text className="text-[15px] font-black text-[#1C1C1C] mr-1 uppercase tracking-tight">
                  {selectedAddress.label}
                </Text>
                <ChevronDown size={14} color="#E23744" strokeWidth={3} />
              </View>
              <Text numberOfLines={1} className="text-[#93959F] text-[12px] font-medium">
                {selectedAddress.addressLine1}
              </Text>
            </>
          ) : (
            <View className="flex-row items-center">
              <Text className="text-[14px] font-bold text-[#93959F]">
                Select delivery location
              </Text>
              <ChevronDown size={14} color="#93959F" strokeWidth={3} className="ml-1" />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onProfilePress}
        className="w-9 h-9 rounded-full bg-[#F5F5F5] justify-center items-center border border-[#E9E9EB]"
      >
        <User size={18} color="#1C1C1C" />
      </TouchableOpacity>
    </View>
  );
};

export default AddressHeader;

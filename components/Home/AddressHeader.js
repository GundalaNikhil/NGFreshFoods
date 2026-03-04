import { ChevronDown, MapPin, User, Plus } from "lucide-react-native";
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
        <View className="w-8 h-8 rounded-full bg-[#107A4A]/10 justify-center items-center">
          {selectedAddress ? (
            <MapPin size={16} color="#107A4A" strokeWidth={2.5} />
          ) : (
            <MapPin size={16} color="#9CA3AF" strokeWidth={2.5} />
          )}
        </View>

        <View className="ml-3 flex-1">
          {selectedAddress ? (
            <>
              <View className="flex-row items-center">
                <Text className="text-[15px] font-black text-[#111827] mr-1 uppercase tracking-tight">
                  {selectedAddress.label}
                </Text>
                <ChevronDown size={14} color="#107A4A" strokeWidth={3} />
              </View>
              <Text numberOfLines={1} className="text-[#6b7280] text-[12px] font-medium">
                {selectedAddress.addressLine1}
              </Text>
            </>
          ) : (
            <View className="flex-row items-center">
              <Text className="text-[14px] font-bold text-gray-500">
                Select delivery location
              </Text>
              <ChevronDown size={14} color="#9CA3AF" strokeWidth={3} className="ml-1" />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onProfilePress}
        className="w-9 h-9 rounded-full bg-white justify-center items-center border border-gray-100 shadow-sm"
      >
        <User size={18} color="#334155" />
      </TouchableOpacity>
    </View>
  );
};

export default AddressHeader;

import { ChevronDown, MapPin, Search, User } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAddress } from "../../hooks/useAddress";
import { useRecoilValue } from "recoil";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import { useNavigation } from "@react-navigation/native";

const AddressHeader = ({ onAddressPress, onProfilePress, onSearchPress }) => {
  const { selectedAddress } = useAddress();
  const profile = useRecoilValue(profileAtom);
  const navigation = useNavigation();
  
  // Extract a premium 2-letter substring for the avatar
  const userSubstring = profile?.firstName ? profile.firstName.substring(0, 2).toUpperCase() : "U";

  const locationName = selectedAddress?.label === "HOME" || selectedAddress?.label === "WORK" || selectedAddress?.label === "OTHER"
    ? selectedAddress.label.charAt(0).toUpperCase() + selectedAddress.label.slice(1).toLowerCase()
    : selectedAddress?.label || "Select Address";

  return (
    <View className="flex-row items-center justify-between py-1 mb-2">
      {/* LEFT: Address */}
      <TouchableOpacity 
        className="flex-row items-center flex-1" 
        onPress={onAddressPress}
        activeOpacity={0.7}
      >
        <MapPin size={22} color="#E23744" strokeWidth={2.5} />
        <View className="ml-2 flex-1">
          <View className="flex-row items-center">
            <Text className="text-[16px] font-black text-[#1C1C1C] tracking-tight">{locationName}</Text>
            <ChevronDown size={18} color="#1C1C1C" strokeWidth={2.5} className="ml-1" />
          </View>
          <Text className="text-[12px] text-[#686B78] mt-0.5" numberOfLines={1}>
            {selectedAddress?.street || "Add your delivery address"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* RIGHT: Search & Profile */}
      <View className="flex-row items-center">
        <TouchableOpacity 
          onPress={onSearchPress}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-[#F5F5F5] items-center justify-center"
        >
          <Search size={20} color="#1C1C1C" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <View className="w-10 h-10 rounded-full bg-[#FDF8EE] border border-[#F2E3C6] items-center justify-center ml-3 shadow-sm">
            <Text className="text-[#C69C6D] font-black text-[15px] tracking-widest">{userSubstring}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddressHeader;

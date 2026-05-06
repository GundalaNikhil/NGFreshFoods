import { ChevronDown, MapPin, ShoppingCart } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAddress } from "../../hooks/useAddress";
import { useRecoilValue } from "recoil";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../hooks/useCart";

const AddressHeader = ({ onAddressPress, onProfilePress }) => {
  const { selectedAddress } = useAddress();
  const profile = useRecoilValue(profileAtom);
  const navigation = useNavigation();
  const { cart } = useCart();
  
  const cartItemCount = cart?.length || 0;
  
  // Extract the first initial of the user's name
  const userInitial = profile?.firstName?.charAt(0)?.toUpperCase() || "U";

  const locationName = selectedAddress?.label === "HOME" || selectedAddress?.label === "WORK" || selectedAddress?.label === "OTHER"
    ? selectedAddress.label.charAt(0).toUpperCase() + selectedAddress.label.slice(1).toLowerCase()
    : selectedAddress?.label || "New York";

  return (
    <View className="flex-row items-center justify-between py-2 mb-2">
      {/* LEFT: Profile */}
      <TouchableOpacity 
        onPress={onProfilePress}
        activeOpacity={0.8}
      >
        <View className="w-11 h-11 rounded-full bg-[#1A1A1A] items-center justify-center shadow-sm border-[1.5px] border-[#D4AF37]">
          <Text className="text-[#D4AF37] font-black text-[16px] tracking-widest">{userInitial}</Text>
        </View>
      </TouchableOpacity>

      {/* CENTER: Address */}
      <TouchableOpacity 
        className="flex-row items-center justify-center flex-1 mx-4" 
        onPress={onAddressPress}
        activeOpacity={0.7}
      >
        <MapPin size={18} color="#1C1C1C" strokeWidth={2.5} />
        <Text className="text-[16px] font-semibold text-[#1C1C1C] mx-1" numberOfLines={1}>
          {locationName}
        </Text>
        <ChevronDown size={18} color="#1C1C1C" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* RIGHT: Cart */}
      <TouchableOpacity 
        onPress={() => navigation.navigate("Cart")}
        activeOpacity={0.8}
      >
        <View className="relative w-11 h-11 rounded-full bg-white border border-[#E9E9EB] items-center justify-center shadow-sm">
          <ShoppingCart size={20} color="#1C1C1C" strokeWidth={2} />
          {cartItemCount > 0 && (
            <View className="absolute -top-1.5 -right-1.5 bg-[#E23744] w-5 h-5 rounded-full items-center justify-center border-2 border-white">
              <Text className="text-white text-[9px] font-black">{cartItemCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default AddressHeader;

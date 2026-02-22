import { ChevronDown, MapPin, User } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const AddressHeader = () => {
  return (
    <View className="flex-row items-center justify-between py-0.5">
      <TouchableOpacity className="flex-row items-center flex-1 pr-3">
        <View className="w-6 h-6 rounded-full bg-[#e9f2df] justify-center items-center">
          <MapPin size={13} color="#4d7c0f" />
        </View>

        <View className="ml-2 flex-1 flex-row items-center">
          <Text className="text-[14px] font-extrabold text-[#111827] mr-1">
            Home
          </Text>
          <Text numberOfLines={1} className="text-[#6b7280] text-[11px] flex-1">
            H-12, Sector 63, Noida
          </Text>
          <ChevronDown size={13} color="#111827" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity className="w-8 h-8 rounded-full bg-white justify-center items-center border border-[#dce6d2]">
        <User size={15} color="#334155" />
      </TouchableOpacity>
    </View>
  );
};

export default AddressHeader;

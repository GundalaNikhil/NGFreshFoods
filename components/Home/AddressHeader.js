import { ChevronDown, MapPin, User } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const AddressHeader = () => {
  return (
    <View className="flex-row items-center justify-between py-1">
      <TouchableOpacity className="flex-row items-center flex-1 pr-4">
        {/* Map Pin with Background Circle */}
        <View className="w-8 h-8 rounded-full bg-red-50 justify-center items-center">
          <MapPin size={16} color="#E23744" fill="#E23744" fillOpacity={0.1} />
        </View>

        <View className="ml-2.5 flex-1">
          <View className="flex-row items-center">
            <Text className="text-[15px] font-bold text-gray-900 mr-1">Home</Text>
            <ChevronDown size={14} color="#000" strokeWidth={3} />
          </View>
          <Text 
            numberOfLines={1} 
            className="text-gray-500 text-[11px] font-medium"
          >
            H-12, Sector 63, Noida, Uttar Pradesh 201301
          </Text>
        </View>
      </TouchableOpacity>

      {/* Profile Icon */}
      <TouchableOpacity className="w-8 h-8 rounded-full bg-gray-50 justify-center items-center border border-gray-100">
        <User size={18} color="#4A4A4A" />
      </TouchableOpacity>
    </View>
  );
};

export default AddressHeader;

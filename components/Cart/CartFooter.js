import { ChevronRight, MapPin } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const CartFooter = ({ totalPayable, itemCount }) => {
  if (itemCount === 0) return null;

  return (
    <View className="bg-white border-t border-gray-100">
      {/* Main CTA */}
      <View className="px-4 py-4 pb-24">
        <TouchableOpacity
          activeOpacity={0.9}
          className="bg-[#E23744] rounded-xl h-14 flex-row items-center px-5 justify-between shadow-lg shadow-red-200"
        >
          <View>
            <Text className="text-white font-black text-[18px]">
              ₹{totalPayable.toFixed(2)}
            </Text>
            <Text className="text-white/80 font-bold text-[10px] uppercase">
              Total Payable
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-white font-black text-[17px] mr-1 uppercase">
              Place Order
            </Text>
            <ChevronRight size={20} color="#fff" strokeWidth={4} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartFooter;

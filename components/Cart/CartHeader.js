// components/Cart/CartHeader.jsx
import { ShoppingBag } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const CartHeader = ({ itemCount }) => {
  return (
    <View className="bg-white p-4 border-b border-gray-200">
      <View className="flex-row items-center">
        <ShoppingBag size={24} color="#000" />
        <Text className="text-xl font-bold ml-2">
          Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
        </Text>
      </View>
    </View>
  );
};

export default CartHeader;

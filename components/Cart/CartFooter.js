import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const CartFooter = ({ total, itemCount }) => {
  const handleCheckout = () => {
    // Implement checkout logic
    console.log("Proceeding to checkout");
  };

  return (
    <View className="bg-white p-4 border-t border-gray-200">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-gray-600">Total Amount</Text>
          <Text className="text-xl font-bold">₹{total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          onPress={handleCheckout}
          className="bg-black px-6 py-3 rounded-lg"
          disabled={itemCount === 0}
        >
          <Text className="text-white font-bold text-lg">
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartFooter;

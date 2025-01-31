// components/Cart/CartItems.jsx
import { Minus, Plus, Trash2 } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../hooks/useCart";

const CartItems = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const renderCustomizations = (customizations) => {
    if (!customizations) return null;

    return (
      <View className="mt-1">
        <Text className="text-sm text-gray-500">
          {Object.entries(customizations)
            .map(([key, value]) => `${key}: ${value}`)
            .join(" | ")}
        </Text>
      </View>
    );
  };

  return (
    <View className="bg-white p-4 mb-4">
      {cart.map((item) => (
        <View
          key={item.productId}
          className="flex-row py-4 border-b border-gray-100"
        >
          <Image
            source={{ uri: item.image }}
            className="w-24 h-24 rounded-lg"
            resizeMode="cover"
          />

          <View className="flex-1 ml-4">
            <Text className="font-bold text-lg">{item.name}</Text>
            {renderCustomizations(item.customizations)}

            <View className="flex-row justify-between items-center mt-2">
              <View>
                <Text className="text-lg font-bold">₹{item.price}</Text>
                <Text className="text-sm text-gray-500 line-through">
                  ₹{item.mrp}
                </Text>
              </View>

              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                  className="bg-gray-100 p-2 rounded-lg"
                >
                  <Minus size={16} color="#000" />
                </TouchableOpacity>

                <Text className="mx-4 font-bold">{item.quantity}</Text>

                <TouchableOpacity
                  onPress={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                  className="bg-gray-100 p-2 rounded-lg"
                >
                  <Plus size={16} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => removeFromCart(item.productId)}
                  className="ml-4"
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default CartItems;

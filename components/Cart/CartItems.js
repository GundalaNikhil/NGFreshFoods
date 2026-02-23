import { Minus, Plus } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../hooks/useCart";

const CartItems = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(item.productId);
    } else {
      updateQuantity(item.productId, newQuantity);
    }
  };

  return (
    <View className="px-4 py-2">
      {cart.map((item, index) => (
        <View 
          key={item.productId} 
          className="flex-row items-center py-4 border-b border-gray-50 last:border-b-0"
        >
          {/* Left: Image */}
          <View className="mr-3">
            <Image
              source={{ uri: item.image_url }}
              className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100"
              resizeMode="cover"
            />
          </View>

          {/* Middle: Name & Details */}
          <View className="flex-1">
            <View className="flex-row items-center mb-0.5">
              <View className="w-3.5 h-3.5 border border-red-600 items-center justify-center rounded-[2px] mr-2">
                <View className="w-1.5 h-1.5 rounded-full bg-red-600" />
              </View>
              <Text className="text-[14px] font-bold text-gray-900 leading-tight flex-1">
                {item.name}
              </Text>
            </View>
            
            <View className="flex-row flex-wrap mt-1.5">
              {item.customizations && Object.entries(item.customizations).map(([key, value], i) => (
                <View 
                  key={i} 
                  className="bg-gray-100/80 px-2 py-0.5 rounded-md mr-1.5 mb-1.5 border border-gray-200/50"
                >
                  <Text className="text-[10px] text-gray-600 font-bold uppercase tracking-tight">
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Right: Quantity & Price */}
          <View className="items-end">
            <View className="bg-white border border-gray-200 rounded-lg h-7 flex-row items-center shadow-sm shadow-black/5 min-w-[70px] justify-between mb-2">
              <TouchableOpacity
                onPress={() => handleQuantityChange(item, item.custQuantity - 1)}
                className="w-6 items-center justify-center h-full"
              >
                <Minus size={12} color="#1C1C1C" strokeWidth={4} />
              </TouchableOpacity>
              
              <Text className="text-[12px] font-black text-gray-900">
                {item.custQuantity}
              </Text>

              <TouchableOpacity
                onPress={() => handleQuantityChange(item, item.custQuantity + 1)}
                className="w-6 items-center justify-center h-full"
              >
                <Plus size={12} color="#1C1C1C" strokeWidth={4} />
              </TouchableOpacity>
            </View>
            
            <Text className="text-[13px] font-bold text-gray-900">
              ₹{item.totalPrice}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default CartItems;

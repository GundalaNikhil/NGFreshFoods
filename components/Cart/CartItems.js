import { Minus, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../hooks/useCart";
import { getEntityImageUrl } from "../../utils/imageUrl";
import { isVegProduct } from "../../utils/productClassification";
import CachedImage from "../ResuableComponents/CachedImage";

const CartItems = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [updatingKey, setUpdatingKey] = useState(null);

  const handleQuantityChange = (item, newQuantity) => {
    setUpdatingKey(item.cartKey);
    if (newQuantity === 0) {
      removeFromCart(item.cartKey);
    } else {
      updateQuantity(item.cartKey, newQuantity);
    }
    globalThis.setTimeout(() => {
      setUpdatingKey(null);
    }, 120);
  };

  return (
    <View className="px-4 py-2">
      {cart.map((item) => {
        const imageUri =
          getEntityImageUrl(item) ||
          "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800&auto=format&fit=crop";
        const isVeg = isVegProduct(item);

        return (
        <View
          key={item.cartKey}
          className="flex-row items-center py-4 border-b border-gray-50 last:border-b-0"
        >
          {/* Left: Image */}
          <View className="mr-3">
            <CachedImage
              source={imageUri}
              style={{ width: 64, height: 64, borderRadius: 12 }}
              contentFit="cover"
              transition={100}
              onError={(event) =>
                console.log(
                  "[ImageError][CartItems]",
                  item?.name,
                  imageUri,
                  event?.nativeEvent?.error
                )
              }
            />
          </View>

          {/* Middle: Name & Details */}
          <View className="flex-1">
            <View className="flex-row items-center mb-0.5">
              <View
                className={`w-3.5 h-3.5 border ${isVeg ? "border-green-600" : "border-red-600"} items-center justify-center rounded-[2px] mr-2`}
              >
                <View className={`w-1.5 h-1.5 rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`} />
              </View>
              <Text className="text-[14px] font-bold text-gray-900 leading-tight flex-1">
                {item.name}
              </Text>
            </View>
            
            {/* Variant + Addon tags */}
            <View className="flex-row flex-wrap mt-1.5">
              {item.variantLabel && (
                <View className="bg-rose-50 px-2 py-0.5 rounded-md mr-1.5 mb-1.5 border border-rose-200/50">
                  <Text className="text-[10px] text-rose-700 font-bold uppercase tracking-tight">
                    {item.variantLabel}
                  </Text>
                </View>
              )}
              {(item.addonLabels || []).map((label, i) => (
                <View 
                  key={i} 
                  className="bg-gray-100/80 px-2 py-0.5 rounded-md mr-1.5 mb-1.5 border border-gray-200/50"
                >
                  <Text className="text-[10px] text-gray-600 font-bold uppercase tracking-tight">
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Right: Quantity & Price */}
          <View className="items-end">
            <View className="bg-white border border-rose-100 rounded-lg h-8 flex-row items-center shadow-sm shadow-black/5 min-w-[80px] justify-between mb-2">
              <TouchableOpacity
                onPress={() => handleQuantityChange(item, item.quantity - 1)}
                className="w-7 items-center justify-center h-full"
                disabled={updatingKey === item.cartKey}
              >
                <Minus size={14} color="#E23744" strokeWidth={4} />
              </TouchableOpacity>
              
              {updatingKey === item.cartKey ? (
                <ActivityIndicator size="small" color="#E23744" />
              ) : (
                <Text className="text-[13px] font-black text-gray-900">
                  {item.quantity}
                </Text>
              )}

              <TouchableOpacity
                onPress={() => handleQuantityChange(item, item.quantity + 1)}
                className="w-7 items-center justify-center h-full"
                disabled={updatingKey === item.cartKey}
              >
                <Plus size={14} color="#E23744" strokeWidth={4} />
              </TouchableOpacity>
            </View>
            
            <Text className="text-[13px] font-bold text-gray-900">
              ₹{item.lineTotal}
            </Text>
          </View>
        </View>
      )})}
    </View>
  );
};

export default React.memo(CartItems);

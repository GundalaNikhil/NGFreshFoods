import { ShoppingCart } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../hooks/useCart";
import ChickenCustomizationModal from "./ChickenCustomizationModal";

const ProductCard = ({ product, onAddToCart }) => {
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const { addToCart } = useCart();

  const discountPercentage = Math.round(
    ((product.mrp - product.base_price) / product.mrp) * 100
  );

  const handleAddToCartClick = () => {
    if (product.category_id === "CAT_DAIRY_EGGS") {
      addToCart(product);
    } else {
      setQuantityModalVisible(true);
    }
  };

  const handleCustomizedAddToCart = (customizedProduct) => {
    addToCart(product, customizedProduct.customizations);
    setQuantityModalVisible(false);
  };

  return (
    <View className="bg-white border-b border-gray-100 p-4">
      <View className="flex-row">
        {/* Left Info Section */}
        <View className="flex-1 pr-4">
          <View className="flex-row items-center mb-1">
            <View className="w-4 h-4 border border-green-600 items-center justify-center mr-2">
              <View className="w-2 h-2 rounded-full bg-green-600" />
            </View>
            {product.tags?.[0] && (
              <Text className="text-[11px] font-bold text-orange-500 uppercase">
                {product.tags[0]}
              </Text>
            )}
          </View>
          
          <Text className="text-[17px] font-bold text-gray-900 leading-tight">
            {product.name}
          </Text>
          
          <View className="flex-row items-center mt-1.5">
            <Text className="text-[15px] font-bold text-gray-900">₹{product.base_price}</Text>
            <Text className="text-[13px] text-gray-500 line-through ml-2">₹{product.mrp}</Text>
          </View>

          <Text className="text-[12px] text-gray-500 mt-1 font-medium italic">
            {product.unit}
          </Text>

          <Text className="text-[13px] text-gray-500 mt-2 leading-relaxed" numberOfLines={2}>
            {product.description}
          </Text>
        </View>

        {/* Right Image Section */}
        <View className="items-center">
          <View className="relative">
            <Image
              source={{ uri: product.image_url }}
              className="w-32 h-32 rounded-xl"
              resizeMode="cover"
            />
            {/* Swiggy-style ADD Button */}
            <TouchableOpacity
              onPress={handleAddToCartClick}
              className="absolute -bottom-3 self-center bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-2"
              activeOpacity={0.8}
            >
              <Text className="text-red-600 font-bold text-[14px]">ADD</Text>
              <View className="absolute top-1 right-2">
                <Text className="text-[10px] text-red-600 font-bold">+</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text className="text-[10px] text-gray-400 mt-4 text-center">
            Customizable
          </Text>
        </View>
      </View>

      {/* Customization Modal */}
      {product.category_id === "CAT_CHICKEN" && (
        <ChickenCustomizationModal
          visible={quantityModalVisible}
          product={product}
          onClose={() => setQuantityModalVisible(false)}
          onAddToCart={handleCustomizedAddToCart}
        />
      )}
    </View>
  );
};

export default ProductCard;

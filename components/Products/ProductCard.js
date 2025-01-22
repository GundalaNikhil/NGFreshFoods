import { ShoppingCart } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ProductQuantityModal from "./ChickenCustomizationModal";

const ProductCard = ({ product, onAddToCart }) => {
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);

  const discountPercentage = Math.round(
    ((product.mrp - product.price) / product.mrp) * 100
  );

  const handleAddToCartClick = () => {
    setQuantityModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        className="w-full bg-white rounded-lg shadow-sm mb-4"
        onPress={handleAddToCartClick}
      >
        <View className="p-4">
          {/* Image */}
          <Image
            source={{ uri: product.image }}
            className="w-full h-48 rounded-lg"
            resizeMode="cover"
          />

          {/* Title */}
          <Text className="text-xl font-bold mt-3">{product.name}</Text>

          {/* Description */}
          <Text className="text-gray-600 mt-2" numberOfLines={2}>
            {product.description}
          </Text>

          {/* Tags */}
          <View className="flex-row flex-wrap mt-3">
            {product.tags.map((tag, index) => (
              <View
                key={index}
                className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
              >
                <Text className="text-sm text-gray-600">{tag}</Text>
              </View>
            ))}
          </View>

          {/* Price and Discount Section */}
          <View className="flex-row items-center mt-3">
            <Text className="text-xl font-bold">₹{product.price}</Text>
            <Text className="text-sm text-gray-500 line-through ml-2">
              ₹{product.mrp}
            </Text>
            <Text className="text-sm text-green-600 ml-2">
              {discountPercentage}% off
            </Text>
          </View>

          {/* Bottom Section */}
          <View className="flex-row justify-between items-center mt-3">
            <Text className="text-sm text-gray-500">{product.perQuantity}</Text>
            <TouchableOpacity
              onPress={handleAddToCartClick}
              className="bg-red-500 px-4 py-2 rounded-lg flex-row items-center"
              activeOpacity={0.8}
            >
              <ShoppingCart size={16} color="white" />
              <Text className="text-white ml-2 font-medium">ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      <ProductQuantityModal
        visible={quantityModalVisible}
        product={product}
        onClose={() => setQuantityModalVisible(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

export default ProductCard;

import { X } from "lucide-react-native";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProductModal = ({ visible, product, onClose, onAddToCart }) => {
  if (!product) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center">
        <View className="bg-white rounded-3xl mx-4 max-h-[90%]">
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-4 top-4 z-10 bg-gray-100 rounded-full p-2"
          >
            <X size={20} />
          </TouchableOpacity>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View className="p-4">
              <Image
                source={{ uri: product.image_url }}
                className="w-full h-64 rounded-lg"
                resizeMode="cover"
              />

              <View className="mt-4">
                <Text className="text-2xl font-bold">{product.name}</Text>
                <Text className="text-gray-600 mt-2">
                  {product.description}
                </Text>

                <View className="mt-4">
                  <Text className="font-semibold">Nutritional Info</Text>
                  <View className="flex-row mt-2">
                    <Text className="text-gray-600">
                      Protein: {product.nutritional_info.protein}
                    </Text>
                    <Text className="text-gray-600 mx-4">|</Text>
                    <Text className="text-gray-600">
                      Fat: {product.nutritional_info.fat}
                    </Text>
                    <Text className="text-gray-600 mx-4">|</Text>
                    <Text className="text-gray-600">
                      {product.nutritional_info.calories}
                    </Text>
                  </View>
                </View>

                <View className="mt-4">
                  <Text className="font-semibold">Tags</Text>
                  <View className="flex-row flex-wrap mt-2">
                    {product.tags.map((tag, index) => (
                      <View
                        key={index}
                        className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
                      >
                        <Text>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="p-4 border-t border-gray-200">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-2xl font-bold">₹{product.base_price}</Text>
                <Text className="text-gray-500 line-through">
                  ₹{product.mrp}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="bg-red-500 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">ADD TO CART</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProductModal;

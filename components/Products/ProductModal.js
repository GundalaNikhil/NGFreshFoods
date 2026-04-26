import { X } from "lucide-react-native";
import React from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getEntityImageUrl } from "../../utils/imageUrl";
import CachedImage from "../ResuableComponents/CachedImage";

const ProductModal = ({ visible, product, onClose, onAddToCart }) => {
  if (!product) return null;
  const imageUri =
    getEntityImageUrl(product) ||
    "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800&auto=format&fit=crop";

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
            className="absolute right-4 top-4 z-10 bg-[#F5F5F5] rounded-full p-2"
          >
            <X size={20} color="#1C1C1C" />
          </TouchableOpacity>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View className="p-4">
              <CachedImage
                source={imageUri}
                style={{ width: "100%", height: 256, borderRadius: 16 }}
                contentFit="cover"
                onError={(event) =>
                  console.log(
                    "[ImageError][ProductModal]",
                    product?.name,
                    imageUri,
                    event?.nativeEvent?.error
                  )
                }
              />

              <View className="mt-4">
                <Text className="text-2xl font-bold text-[#1C1C1C]">{product.name}</Text>
                <Text className="text-[#686B78] mt-2">
                  {product.description}
                </Text>

                <View className="mt-4">
                  <Text className="font-semibold text-[#1C1C1C]">Nutritional Info</Text>
                  <View className="flex-row mt-2">
                    <Text className="text-[#686B78]">
                      Protein: {product.nutritional_info.protein}
                    </Text>
                    <Text className="text-[#E9E9EB] mx-4">|</Text>
                    <Text className="text-[#686B78]">
                      Fat: {product.nutritional_info.fat}
                    </Text>
                    <Text className="text-[#E9E9EB] mx-4">|</Text>
                    <Text className="text-[#686B78]">
                      {product.nutritional_info.calories}
                    </Text>
                  </View>
                </View>

                <View className="mt-4">
                  <Text className="font-semibold text-[#1C1C1C]">Tags</Text>
                  <View className="flex-row flex-wrap mt-2">
                    {product.tags.map((tag, index) => (
                      <View
                        key={index}
                        className="bg-[#FFF0F1] rounded-full px-3 py-1 mr-2 mb-2"
                      >
                        <Text className="text-[#E23744] text-xs font-semibold">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="p-4 border-t border-[#E9E9EB]">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-2xl font-bold text-[#1C1C1C]">₹{product.base_price}</Text>
                <Text className="text-[#93959F] line-through">
                  ₹{product.mrp}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="bg-[#E23744] px-6 py-3 rounded-xl"
                style={{
                  shadowColor: "#E23744",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text className="text-white font-bold">ADD TO CART</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProductModal;

import React, { useCallback, useMemo } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useProducts } from "../../../hooks/useProducts";
import CategoryItem from "./CategoryItem";

const CATEGORY_IMAGE_MAP = {
  CAT_CHICKEN:
    "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513962/ffw/Fresh%20Whole%20Chicken/ri4imwvokptjrw6hcqpq.jpg",
  CAT_DAIRY_EGGS:
    "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513888/ffw/Farm%20Fresh%20Eggs%20%28Pack%20of%2012%29/g8hwht5nvy5vytuhbomy.jpg",
  CAT_MUTTON:
    "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513962/ffw/Fresh%20Whole%20Chicken/ri4imwvokptjrw6hcqpq.jpg",
};

const FALLBACK_CATEGORY_IMAGE =
  "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513962/ffw/Fresh%20Whole%20Chicken/ri4imwvokptjrw6hcqpq.jpg";

const CategoriesList = () => {
  const navigation = useNavigation();
  const { categories, setSelectedCategory } = useProducts();
  const screenWidth = Dimensions.get("window").width;
  const itemSize = useMemo(() => Math.min(116, screenWidth / 3.15), [screenWidth]);

  const handleCategoryPress = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    navigation.navigate("Products");
  }, [navigation, setSelectedCategory]);

  return (
    <View>
      <View className="flex-row items-center justify-between px-1 mb-4">
        <Text className="text-[23px] font-extrabold text-[#1f2937]">
          Shop By Category
        </Text>
        <Text className="text-[11px] font-semibold text-[#3f6212]">
          Curated fresh picks
        </Text>
      </View>
      <Text className="text-xs text-[#64748b] px-1 mb-4">
        Farm-sourced essentials delivered with trusted cold-chain handling.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 2, paddingRight: 10 }}
      >
        {categories.map((category, index) => (
          <CategoryItem
            key={category.category_id || category.name || index}
            title={category.name}
            image={
              category.image_url ||
              category.imageUrl ||
              CATEGORY_IMAGE_MAP[category.category_id] ||
              FALLBACK_CATEGORY_IMAGE
            }
            itemSize={itemSize}
            onPress={() => handleCategoryPress(category.category_id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoriesList;

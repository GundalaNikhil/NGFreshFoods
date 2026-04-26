import React, { useCallback, useMemo } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useProducts } from "../../../hooks/useProducts";
import { getEntityImageUrl } from "../../../utils/imageUrl";
import { productFoodTypeOptions } from "../../../utils/productClassification";
import CategoryItem from "./CategoryItem";

const CATEGORY_IMAGE_MAP = {
  CAT_CHICKEN:
    "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513962/ffw/Fresh%20Whole%20Chicken/ri4imwvokptjrw6hcqpq.jpg",
  CAT_DAIRY_EGGS:
    "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513887/ffw/Farm%20Fresh%20Eggs%20%28Pack%20of%2012%29/qpibhx9rw11ysgpehnza.jpg",
  CAT_MUTTON:
    "https://res.cloudinary.com/djv3mrzk2/image/upload/v1737391536/goat-rann-cut_1_fuxtwn.jpg",
};

const FALLBACK_CATEGORY_IMAGE =
  "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513962/ffw/Fresh%20Whole%20Chicken/ri4imwvokptjrw6hcqpq.jpg";

const CategoriesList = () => {
  const navigation = useNavigation();
  const { categories, setSelectedCategory, setSelectedFoodType } = useProducts();
  const screenWidth = Dimensions.get("window").width;
  const itemSize = useMemo(() => Math.min(108, (screenWidth - 56) / 3), [screenWidth]);

  const handleCategoryPress = useCallback((categoryId) => {
    setSelectedFoodType(productFoodTypeOptions.ALL);
    setSelectedCategory(categoryId);
    navigation.navigate("Products");
  }, [navigation, setSelectedCategory, setSelectedFoodType]);

  return (
    <View className="items-center">
      <View className="items-center px-1 mb-3">
        <Text className="text-[23px] font-extrabold text-[#1f2937] text-center">
          Shop By Category
        </Text>
        <Text className="mt-1 text-[11px] font-semibold text-[#3f6212] text-center">
          Curated fresh picks
        </Text>
      </View>
      <Text className="text-xs text-[#64748b] px-4 mb-4 text-center">
        Farm-sourced essentials delivered with trusted cold-chain handling.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ width: "100%" }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        {categories.map((category, index) => (
          <CategoryItem
            key={category.category_id || category.name || index}
            title={category.name}
            image={
              CATEGORY_IMAGE_MAP[category.category_id] ||
              getEntityImageUrl(category) ||
              FALLBACK_CATEGORY_IMAGE
            }
            itemSize={itemSize}
            isLast={index === categories.length - 1}
            onPress={() => handleCategoryPress(category.category_id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoriesList;

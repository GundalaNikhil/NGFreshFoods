import React from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useProducts } from "../../../hooks/useProducts";
import CategoryItem from "./CategoryItem";

const CATEGORY_IMAGE_MAP = {
  CAT_CHICKEN:
    "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513830/ffw/Chicken%20Small%20Cut%20Pieces/vrigj9t1jbw5oihsuyqn.jpg",
  CAT_DAIRY_EGGS:
    "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513888/ffw/Farm%20Fresh%20Eggs%20%28Pack%20of%2012%29/g8hwht5nvy5vytuhbomy.jpg",
  CAT_MUTTON:
    "https://res.cloudinary.com/djv3mrzk2/image/upload/v1737391536/goat-rann-cut_1_fuxtwn.jpg",
};

const FALLBACK_CATEGORY_IMAGE =
  "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513962/ffw/Fresh%20Whole%20Chicken/ri4imwvokptjrw6hcqpq.jpg";

const CategoriesList = () => {
  const navigation = useNavigation();
  const { categories, setSelectedCategory } = useProducts();
  const screenWidth = Dimensions.get("window").width;
  const itemSize = Math.min(108, screenWidth / 3.3);

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
    navigation.navigate("Products");
  };

  return (
    <View>
      <View className="flex-row items-center justify-between px-1 mb-4">
        <Text className="text-xl font-bold text-gray-900">
          Shop By Category
        </Text>
        <Text className="text-xs font-semibold text-gray-500">
          Fresh picks
        </Text>
      </View>
      <Text className="text-xs text-gray-500 px-1 mb-3">
        Quick commerce style browsing, fresh delivery slots
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 2, paddingRight: 8 }}
      >
        {categories.map((category, index) => (
          <CategoryItem
            key={category.category_id || index}
            title={category.name}
            image={CATEGORY_IMAGE_MAP[category.category_id] || FALLBACK_CATEGORY_IMAGE}
            itemSize={itemSize}
            onPress={() => handleCategoryPress(category.category_id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoriesList;

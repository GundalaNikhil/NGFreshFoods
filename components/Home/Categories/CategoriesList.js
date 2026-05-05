import React, { useCallback, useMemo } from "react";
import { Dimensions, Text, View } from "react-native";
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
  // Calculate item size for a clean 3-column grid
  const itemSize = useMemo(() => (screenWidth - 48) / 3, [screenWidth]);

  const handleCategoryPress = useCallback((categoryId) => {
    setSelectedFoodType(productFoodTypeOptions.ALL);
    setSelectedCategory(categoryId);
    navigation.navigate("Products");
  }, [navigation, setSelectedCategory, setSelectedFoodType]);

  return (
    <View className="items-center w-full">
      <View className="w-full flex-row justify-between items-end mb-4 px-1">
        <View>
          <Text className="text-[22px] font-extrabold text-[#1C1C1C]">
            Shop by Category
          </Text>
          <Text className="text-xs text-[#93959F] mt-1">
            Freshest meat tailored for you
          </Text>
        </View>
        <View className="w-8 h-[3px] rounded-full bg-[#E23744] mb-2" />
      </View>
      
      <View 
        style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          justifyContent: categories.length > 3 ? 'space-between' : 'flex-start',
          gap: categories.length > 3 ? 0 : 8,
          width: '100%',
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
      </View>
    </View>
  );
};

export default CategoriesList;

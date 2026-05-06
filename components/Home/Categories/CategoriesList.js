import React, { useCallback, useMemo } from "react";
import { Dimensions, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useProducts } from "../../../hooks/useProducts";
import { getEntityImageUrl } from "../../../utils/imageUrl";
import { productFoodTypeOptions } from "../../../utils/productClassification";
import CategoryItem from "./CategoryItem";
import cloudinaryUrls from "../../../assets/images/cloudinary_urls.json";

const CATEGORY_IMAGE_MAP = {
  CAT_CHICKEN: cloudinaryUrls.marketing_images.cat_chicken,
  CAT_DAIRY_EGGS: cloudinaryUrls.product_images.premium_farm_eggs,
  CAT_MUTTON: cloudinaryUrls.product_images.premium_raw_mutton,
};

const FALLBACK_CATEGORY_IMAGE = cloudinaryUrls.marketing_images.cat_chicken;

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

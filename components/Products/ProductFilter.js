import { Drumstick, Leaf } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useProducts } from "../../hooks/useProducts";
import { productFoodTypeOptions } from "../../utils/productClassification";

const ProductFilter = () => {
  const {
    categories,
    selectedCategory,
    selectedFoodType,
    setSelectedCategory,
    setSelectedFoodType,
  } = useProducts();
  const foodTypes = [
    { id: productFoodTypeOptions.VEG, label: "Veg", icon: Leaf, color: "#15803d" },
    { id: productFoodTypeOptions.NON_VEG, label: "Non-veg", icon: Drumstick, color: "#dc2626" },
  ];
  const handleAllPress = () => {
    setSelectedCategory("ALL");
    setSelectedFoodType(productFoodTypeOptions.ALL);
  };
  const handleFoodTypePress = (foodType) => {
    setSelectedCategory("ALL");
    setSelectedFoodType(foodType);
  };
  const handleCategoryPress = (categoryId) => {
    setSelectedFoodType(productFoodTypeOptions.ALL);
    setSelectedCategory(categoryId);
  };
  const isAllSelected =
    selectedCategory === "ALL" && selectedFoodType === productFoodTypeOptions.ALL;

  return (
    <View className="border-b border-gray-100 bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
      >
        <TouchableOpacity
          onPress={handleAllPress}
          className={`mr-2 px-4 h-8 items-center justify-center rounded-lg border ${
            isAllSelected
              ? "bg-red-50 border-red-200"
              : "bg-white border-gray-200"
          }`}
        >
          <Text
            className={`text-[13px] font-semibold ${
              isAllSelected ? "text-red-600" : "text-gray-600"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>

        {foodTypes.map((foodType) => {
          const Icon = foodType.icon;
          const isSelected = selectedFoodType === foodType.id;

          return (
            <TouchableOpacity
              key={foodType.id}
              onPress={() => handleFoodTypePress(foodType.id)}
              className={`mr-2 px-3 h-8 flex-row items-center justify-center rounded-lg border ${
                isSelected ? "bg-emerald-50 border-emerald-200" : "bg-white border-gray-200"
              }`}
            >
              <Icon size={14} color={isSelected ? foodType.color : "#6b7280"} />
              <Text
                className={`text-[13px] font-semibold ml-1.5 ${
                  isSelected ? "text-emerald-700" : "text-gray-600"
                }`}
              >
                {foodType.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {categories.map((category) => (
          <TouchableOpacity
            key={category.category_id}
            onPress={() => handleCategoryPress(category.category_id)}
            className={`mr-2 px-4 h-8 items-center justify-center rounded-lg border ${
              selectedCategory === category.category_id
                ? "bg-red-50 border-red-200"
                : "bg-white border-gray-200"
            }`}
          >
            <Text
              className={`text-[13px] font-semibold ${
                selectedCategory === category.category_id
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ProductFilter;

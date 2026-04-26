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
    { id: productFoodTypeOptions.VEG, label: "Veg", icon: Leaf, color: "#60B246" },
    { id: productFoodTypeOptions.NON_VEG, label: "Non-veg", icon: Drumstick, color: "#E23744" },
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
    <View className="border-b border-[#E9E9EB] bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
      >
        <TouchableOpacity
          onPress={handleAllPress}
          className={`mr-2 px-4 h-8 items-center justify-center rounded-full border ${
            isAllSelected
              ? "bg-[#FFF0F1] border-[#E23744]"
              : "bg-white border-[#E9E9EB]"
          }`}
        >
          <Text
            className={`text-[13px] font-semibold ${
              isAllSelected ? "text-[#E23744]" : "text-[#686B78]"
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
              className={`mr-2 px-3 h-8 flex-row items-center justify-center rounded-full border ${
                isSelected 
                  ? foodType.id === productFoodTypeOptions.VEG 
                    ? "bg-[#F0FFF4] border-[#60B246]" 
                    : "bg-[#FFF0F1] border-[#E23744]"
                  : "bg-white border-[#E9E9EB]"
              }`}
            >
              <Icon size={14} color={isSelected ? foodType.color : "#93959F"} />
              <Text
                className={`text-[13px] font-semibold ml-1.5 ${
                  isSelected 
                    ? foodType.id === productFoodTypeOptions.VEG 
                      ? "text-[#60B246]"
                      : "text-[#E23744]"
                    : "text-[#686B78]"
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
            className={`mr-2 px-4 h-8 items-center justify-center rounded-full border ${
              selectedCategory === category.category_id
                ? "bg-[#FFF0F1] border-[#E23744]"
                : "bg-white border-[#E9E9EB]"
            }`}
          >
            <Text
              className={`text-[13px] font-semibold ${
                selectedCategory === category.category_id
                  ? "text-[#E23744]"
                  : "text-[#686B78]"
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

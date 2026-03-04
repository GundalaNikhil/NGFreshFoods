import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { useProducts } from "../../hooks/useProducts";

const ProductFilter = () => {
  const { categories, selectedCategory, setSelectedCategory } = useProducts();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-3 border-b border-gray-100 bg-white"
    >
      <TouchableOpacity
        onPress={() => setSelectedCategory("ALL")}
        className={`ml-4 mr-2 px-4 h-8 items-center justify-center rounded-lg border ${
          selectedCategory === "ALL" 
            ? "bg-red-50 border-red-200" 
            : "bg-white border-gray-200"
        }`}
      >
        <Text
          className={`text-[13px] font-semibold ${
            selectedCategory === "ALL" ? "text-red-600" : "text-gray-600"
          }`}
        >
          All
        </Text>
      </TouchableOpacity>

      {categories.map((category, index) => (
        <TouchableOpacity
          key={category.category_id}
          onPress={() => setSelectedCategory(category.category_id)}
          className={`mr-2 px-4 h-8 items-center justify-center rounded-lg border ${
            selectedCategory === category.category_id
              ? "bg-red-50 border-red-200"
              : "bg-white border-gray-200"
          } ${index === categories.length - 1 ? "mr-4" : ""}`}
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
  );
};

export default ProductFilter;

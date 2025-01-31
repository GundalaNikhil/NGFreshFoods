import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { useProducts } from "../../hooks/useProducts";

const ProductFilter = () => {
  const { categories, selectedCategory, setSelectedCategory } = useProducts();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-4"
    >
      <TouchableOpacity
        onPress={() => setSelectedCategory("ALL")}
        className={`mx-2 px-4 py-2 rounded-full ${
          selectedCategory === "ALL" ? "bg-black" : "bg-gray-200"
        }`}
      >
        <Text
          className={`font-medium ${
            selectedCategory === "ALL" ? "text-white" : "text-gray-800"
          }`}
        >
          All
        </Text>
      </TouchableOpacity>

      {categories.map((category) => (
        <TouchableOpacity
          key={category.category_id}
          onPress={() => setSelectedCategory(category.category_id)}
          className={`mx-2 px-4 py-2 rounded-full ${
            selectedCategory === category.category_id
              ? "bg-black"
              : "bg-gray-200"
          }`}
        >
          <Text
            className={`font-medium ${
              selectedCategory === category.category_id
                ? "text-white"
                : "text-gray-800"
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

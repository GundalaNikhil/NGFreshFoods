import React from "react";
import { View } from "react-native";
import Products from "../Products/Products";

const ProductsScreen = () => {
  return (
    <View className="flex-1 bg-gray-50">
      <Products />
    </View>
  );
};

export default ProductsScreen;

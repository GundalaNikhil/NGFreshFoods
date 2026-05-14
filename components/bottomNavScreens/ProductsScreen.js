import React from "react";
import { View } from "react-native";
import Products from "../Products/Products";

const ProductsScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F7' }}>
      <Products />
    </View>
  );
};

export default ProductsScreen;

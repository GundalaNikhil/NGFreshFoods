import React, { useState } from "react";
import { View } from "react-native";
import { productsData } from "../data/ProductsData";
import ProductList from "./ProductList";
import ProductModal from "./ProductModal";

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ProductList products={productsData} onAddToCart={handleAddToCart} />
      <ProductModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        onAddToCart={(product) => {
          console.log("Added to cart:", product);
          setModalVisible(false);
        }}
      />
    </View>
  );
};

export default Products;

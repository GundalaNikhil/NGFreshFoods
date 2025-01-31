import React, { useState } from "react";
import { View } from "react-native";
import { useProducts } from "../../hooks/useProducts";
import { productsData } from "../data/ProductsData";
import ProductFilter from "./ProductFilter";
import ProductList from "./ProductList";
import ProductModal from "./ProductModal";

const Products = () => {
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ProductFilter />
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

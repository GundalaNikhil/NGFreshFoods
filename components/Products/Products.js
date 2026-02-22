import React, { useState } from "react";
import { SafeAreaView, View } from "react-native";
import { useProducts } from "../../hooks/useProducts";
import AddressHeader from "../Home/AddressHeader";
import SearchBar from "../Home/SearchBar/SearchBar";
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4">
        <View className="mt-1">
          <AddressHeader />
        </View>
        <View className="mt-2">
          <SearchBar />
        </View>
      </View>
      <View className="flex-1 bg-gray-50 mt-3">
        <ProductFilter />
        <ProductList products={products} onAddToCart={handleAddToCart} />
      </View>
      <ProductModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        onAddToCart={(product) => {
          console.log("Added to cart:", product);
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

export default Products;

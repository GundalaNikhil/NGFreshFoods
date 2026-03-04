import React, { useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { useProducts } from "../../hooks/useProducts";
import ProductFilter from "./ProductFilter";
import ProductList from "./ProductList";
import ProductModal from "./ProductModal";
import ProductSearchBar from "./ProductSearchBar";

const Products = () => {
  const { products, loading, error, searchQuery } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isSearching = searchQuery.trim().length > 0;

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-gray-50">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#107A4A" />
            <Text className="text-gray-500 mt-4 font-medium italic">
              {error ? "Reconnecting to server..." : "Fetching fresh farm foods..."}
            </Text>
          </View>
        ) : (
          <>
            <ProductSearchBar />
            {!isSearching && <ProductFilter />}
            <ProductList products={products} onAddToCart={handleAddToCart} />
          </>
        )}
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

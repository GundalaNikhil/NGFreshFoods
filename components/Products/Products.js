import React, { useState, memo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProducts } from "../../hooks/useProducts";
import ProductFilter from "./ProductFilter";
import ProductList from "./ProductList";
import ProductModal from "./ProductModal";
import ProductSearchBar from "./ProductSearchBar";

const ProductListSkeleton = memo(function ProductListSkeleton() {
  return (
  <View className="px-4 pt-3">
    {[0, 1, 2, 3].map((item) => (
      <View key={item} className="mb-4 flex-row rounded-2xl bg-white p-4">
        <View className="mr-4 flex-1">
          <View className="h-4 w-2/3 rounded-full bg-[#E9E9EB]" />
          <View className="mt-3 h-4 w-1/3 rounded-full bg-[#E9E9EB]" />
          <View className="mt-3 h-3 w-full rounded-full bg-[#F5F5F5]" />
          <View className="mt-2 h-3 w-5/6 rounded-full bg-[#F5F5F5]" />
        </View>
        <View className="h-28 w-28 rounded-2xl bg-[#E9E9EB]" />
      </View>
    ))}
  </View>
  );
});

const Products = () => {
  const { products, loading, error, searchQuery, categories, isBootstrapping, isRefreshing } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isSearching = searchQuery.trim().length > 0;

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-[#F5F5F5]">
        <>
          <ProductSearchBar />
          {isRefreshing ? (
            <View className="px-4 pt-2 flex-row items-center bg-white">
              <ActivityIndicator size="small" color="#E23744" />
              <Text className="ml-2 text-xs text-[#93959F]">
                {error ? "Reconnecting catalog..." : "Refreshing products..."}
              </Text>
            </View>
          ) : null}
          {!isSearching && categories.length > 0 && <ProductFilter />}
          {isBootstrapping && products.length === 0 ? (
            <View className="flex-1">
              <ProductListSkeleton />
            </View>
          ) : (
            <ProductList products={products} onAddToCart={handleAddToCart} />
          )}
          {loading && products.length === 0 && !isBootstrapping ? (
            <View className="px-4 py-4">
              <Text className="text-sm text-[#93959F]">
                {error ? "Reconnecting to server..." : "Fetching fresh farm foods..."}
              </Text>
            </View>
          ) : null}
        </>
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

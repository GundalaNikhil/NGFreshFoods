import { SearchX } from "lucide-react-native";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "./ProductCard";

const EmptyState = ({ searchQuery }) => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
    <View
      style={{
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#fef2f2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
      }}
    >
      <SearchX size={28} color="#f87171" strokeWidth={1.8} />
    </View>
    <Text style={{ fontSize: 17, fontWeight: "700", color: "#1f2937", marginBottom: 6 }}>
      No results found
    </Text>
    <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", paddingHorizontal: 40 }}>
      {searchQuery
        ? `We couldn't find anything for "${searchQuery}"`
        : "No products available in this category"}
    </Text>
  </View>
);

const ProductList = ({ products, onAddToCart }) => {
  const { searchQuery } = useProducts();

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard
          key={item.product_id}
          product={item}
          onAddToCart={onAddToCart}
        />
      )}
      keyExtractor={(item) => item.product_id.toString()}
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState searchQuery={searchQuery} />}
      keyboardShouldPersistTaps="handled"
    />
  );
};

export default ProductList;

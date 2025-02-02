import React from "react";
import { FlatList } from "react-native";
import ProductCard from "./ProductCard";

const ProductList = ({ products, onAddToCart }) => {
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
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default ProductList;

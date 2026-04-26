import { SearchX } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { useCart } from "../../hooks/useCart";
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
  const { cart, addToCart, updateQuantity } = useCart();
  const baseCartItemsByProductId = useMemo(() => {
    const itemsByProductId = new Map();
    cart.forEach((item) => {
      if (!item.variantId) {
        itemsByProductId.set(item.productId, item);
      }
    });
    return itemsByProductId;
  }, [cart]);

  const renderItem = useCallback(
    ({ item }) => (
      <ProductCard
        product={item}
        cartItem={baseCartItemsByProductId.get(item.productId || item.id)}
        addToCart={addToCart}
        updateQuantity={updateQuantity}
        onAddToCart={onAddToCart}
      />
    ),
    [addToCart, baseCartItemsByProductId, onAddToCart, updateQuantity]
  );
  const keyExtractor = useCallback(
    (item) => String(item.product_id || item.productId || item.id),
    []
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={6}
      windowSize={5}
      maxToRenderPerBatch={6}
      updateCellsBatchingPeriod={40}
      removeClippedSubviews={false}
      contentContainerStyle={{
        paddingTop: 0,
        paddingHorizontal: 0,
        paddingBottom: 80,
        flexGrow: products.length === 0 ? 1 : 0,
      }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState searchQuery={searchQuery} />}
      keyboardShouldPersistTaps="handled"
    />
  );
};

export default ProductList;

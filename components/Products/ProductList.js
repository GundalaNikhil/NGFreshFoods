import { SearchX } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "./ProductCard";

const EmptyState = ({ searchQuery }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}>
      <SearchX size={30} color="#F87171" strokeWidth={1.6} />
    </View>
    <Text style={styles.emptyTitle}>No results found</Text>
    <Text style={styles.emptySubtitle}>
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
        paddingTop: 4,
        paddingBottom: 100,
        flexGrow: products.length === 0 ? 1 : 0,
      }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState searchQuery={searchQuery} />}
      keyboardShouldPersistTaps="handled"
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 48,
    lineHeight: 20,
  },
});

export default ProductList;

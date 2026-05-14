import React, { useState, memo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProducts } from "../../hooks/useProducts";
import ProductFilter from "./ProductFilter";
import ProductList from "./ProductList";
import ProductSearchBar from "./ProductSearchBar";

const ProductListSkeleton = memo(function ProductListSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[0, 1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonLeft}>
            <View style={[styles.skeletonLine, { width: '65%', height: 14 }]} />
            <View style={[styles.skeletonLine, { width: '35%', height: 14, marginTop: 12 }]} />
            <View style={[styles.skeletonLine, { width: '100%', height: 10, marginTop: 12 }]} />
            <View style={[styles.skeletonLine, { width: '80%', height: 10, marginTop: 8 }]} />
          </View>
          <View style={styles.skeletonImage} />
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FAF5F0', '#F0EBF4', '#EAF2F8', '#F5F0FA']}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mainContainer}
      >
        <>
          <ProductSearchBar />
          {isRefreshing ? (
            <View style={styles.refreshBar}>
              <ActivityIndicator size="small" color="#E23744" />
              <Text style={styles.refreshText}>
                {error ? "Reconnecting catalog..." : "Refreshing products..."}
              </Text>
            </View>
          ) : null}
          {!isSearching && categories.length > 0 && <ProductFilter />}
          {isBootstrapping && products.length === 0 ? (
            <View style={styles.flex1}>
              <ProductListSkeleton />
            </View>
          ) : (
            <ProductList products={products} onAddToCart={handleAddToCart} />
          )}
          {loading && products.length === 0 && !isBootstrapping ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {error ? "Reconnecting to server..." : "Fetching fresh farm foods..."}
              </Text>
            </View>
          ) : null}
        </>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF5F0',
  },
  mainContainer: {
    flex: 1,
  },
  refreshBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#93959F',
    fontWeight: '500',
  },
  flex1: {
    flex: 1,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#93959F',
    fontWeight: '500',
  },
  skeletonContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  skeletonCard: {
    marginBottom: 12,
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  skeletonLeft: {
    flex: 1,
    marginRight: 16,
  },
  skeletonLine: {
    borderRadius: 8,
    backgroundColor: '#E9E9EB',
  },
  skeletonImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#E9E9EB',
  },
});

export default Products;

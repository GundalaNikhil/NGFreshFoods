import { ActivityIndicator, FlatList, SafeAreaView, ScrollView, Text, View, InteractionManager } from "react-native";
import React, { useState, useEffect, useCallback, memo } from "react";
import { SearchX } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useProducts } from "../../hooks/useProducts";
import { useAddress } from "../../hooks/useAddress";
import AddressHeader from "./AddressHeader";
import CategoriesList from "./Categories/CategoriesList";
import HomePageBanner from "./HomePageBanner";
import SearchBar from "./SearchBar/SearchBar";
import Slideshow from "./Slideshow/Slideshow";
import AddressSelectionSheet from "./AddressSelectionSheet";
import AddAddressModal from "./AddAddressModal";
import ProductCard from "../Products/ProductCard";

const SearchEmptyState = ({ searchQuery }) => (
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
      We couldn't find anything for "{searchQuery}"
    </Text>
  </View>
);

const HomePageSkeleton = memo(function HomePageSkeleton() {
  return (
  <View className="px-4 mt-4">
    <View className="h-52 rounded-3xl bg-[#e6ecdf]" />
    <View className="mt-6 flex-row">
      {[0, 1, 2].map((item) => (
        <View key={item} className="mr-3 flex-1">
          <View className="h-28 rounded-2xl bg-[#e6ecdf]" />
          <View className="mt-3 h-3 rounded-full bg-[#d7dfcf]" />
        </View>
      ))}
    </View>
  </View>
  );
});

const HomePage = () => {
  const navigation = useNavigation();
  const { error, products, searchQuery, categories, isBootstrapping, isRefreshing } = useProducts();
  const { refreshAddresses, addAddress } = useAddress();
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      refreshAddresses();
    });

    return () => {
      task?.cancel?.();
    };
  }, [refreshAddresses]);

  const renderSearchResult = useCallback(
    ({ item }) => <ProductCard product={item} onAddToCart={() => {}} />,
    []
  );

  const keyExtractor = useCallback((item) => item.product_id?.toString(), []);

  const shouldShowSkeleton = isBootstrapping && !isSearching && categories.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-[#f3f7ef]">
      {/* Address + Search bar always visible */}
      <View className="px-4 mt-2">
        <AddressHeader onAddressPress={() => setShowAddressSheet(true)} onProfilePress={() => navigation.navigate("Account")} />
      </View>
      <View className="px-4 mt-3">
        <SearchBar />
      </View>

      {isRefreshing ? (
        <View className="px-4 mt-2 flex-row items-center">
          <ActivityIndicator size="small" color="#107A4A" />
          <Text className="ml-2 text-xs text-[#5f6b61]">
            {error ? "Reconnecting catalog..." : "Refreshing today’s stock..."}
          </Text>
        </View>
      ) : null}

      {isSearching ? (
        <FlatList
          data={products}
          renderItem={renderSearchResult}
          keyExtractor={keyExtractor}
          initialNumToRender={5}
          windowSize={5}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={40}
          removeClippedSubviews={true}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<SearchEmptyState searchQuery={searchQuery} />}
          keyboardShouldPersistTaps="handled"
        />
      ) : shouldShowSkeleton ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          <HomePageSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          <View className="mt-4">
            <Slideshow />
          </View>

          <View className="px-4 mt-6">
            <CategoriesList />
          </View>

          <View className="px-4 mt-6">
            <HomePageBanner />
          </View>
        </ScrollView>
      )}

      <AddressSelectionSheet
        visible={showAddressSheet}
        onClose={() => setShowAddressSheet(false)}
        onAddPress={() => setShowAddAddressModal(true)}
      />

      <AddAddressModal
        visible={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onAdd={addAddress}
      />
    </SafeAreaView>
  );
};

export default HomePage;

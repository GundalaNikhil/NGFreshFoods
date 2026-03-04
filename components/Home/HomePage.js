import { ActivityIndicator, FlatList, SafeAreaView, ScrollView, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { SearchX } from "lucide-react-native";
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

const HomePage = () => {
  const { loading, error, products, searchQuery } = useProducts();
  const { refreshAddresses, addAddress } = useAddress();
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#107A4A" />
        <Text className="text-gray-400 mt-4 font-medium italic">
          {error ? "Reconnecting to server..." : "Preparing your fresh experience..."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f3f7ef]">
      {/* Address + Search bar always visible */}
      <View className="px-4 mt-2">
        <AddressHeader onAddressPress={() => setShowAddressSheet(true)} />
      </View>
      <View className="px-4 mt-3">
        <SearchBar />
      </View>

      {isSearching ? (
        /* Search results take over the whole screen */
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <ProductCard product={item} onAddToCart={() => {}} />
          )}
          keyExtractor={(item) => item.product_id?.toString()}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<SearchEmptyState searchQuery={searchQuery} />}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        /* Normal homepage content */
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

import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, ScrollView, Text, View, InteractionManager } from "react-native";
import React, { useState, useEffect, useCallback, memo } from "react";
import { SearchX, Store } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchShopStatus } from "../../services/bff/shopBff";
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
        backgroundColor: "#FFF0F1",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
      }}
    >
      <SearchX size={28} color="#E23744" strokeWidth={1.8} />
    </View>
    <Text style={{ fontSize: 17, fontWeight: "700", color: "#1C1C1C", marginBottom: 6 }}>
      No results found
    </Text>
    <Text style={{ fontSize: 13, color: "#93959F", textAlign: "center", paddingHorizontal: 40 }}>
      We couldn't find anything for "{searchQuery}"
    </Text>
  </View>
);

const HomePageSkeleton = memo(function HomePageSkeleton() {
  return (
  <View className="px-4 mt-4">
    <View className="h-52 rounded-3xl bg-[#E9E9EB]" />
    <View className="mt-6 flex-row">
      {[0, 1, 2].map((item) => (
        <View key={item} className="mr-3 flex-1">
          <View className="h-28 rounded-2xl bg-[#E9E9EB]" />
          <View className="mt-3 h-3 rounded-full bg-[#D5D5D8]" />
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
  const [shopStatus, setShopStatus] = useState({ isOpen: true, message: "" });
  const [pullRefreshing, setPullRefreshing] = useState(false);

  const isSearching = searchQuery.trim().length > 0;

  // Silent shop status poll (no loading indicator)
  const refreshShopStatusSilent = useCallback(() => {
    fetchShopStatus().then((result) => {
      if (result?.data) setShopStatus(result.data);
    });
  }, []);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      refreshAddresses();
      refreshShopStatusSilent();
    });

    // Poll shop status every 60 seconds (silent background refresh)
    const pollInterval = setInterval(refreshShopStatusSilent, 60000);

    return () => {
      task?.cancel?.();
      clearInterval(pollInterval);
    };
  }, [refreshAddresses, refreshShopStatusSilent]);

  // Pull-to-refresh handler (like Zepto)
  const handlePullRefresh = useCallback(async () => {
    setPullRefreshing(true);
    await Promise.all([
      refreshAddresses(),
      refreshShopStatusSilent(),
    ]);
    // Small delay for smooth UX
    setTimeout(() => setPullRefreshing(false), 600);
  }, [refreshAddresses, refreshShopStatusSilent]);

  const renderSearchResult = useCallback(
    ({ item }) => <ProductCard product={item} onAddToCart={() => {}} />,
    []
  );

  const keyExtractor = useCallback((item) => item.product_id?.toString(), []);

  const shouldShowSkeleton = isBootstrapping && !isSearching && categories.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {isSearching ? (
        <>
          <View className="px-5 mt-2">
            <AddressHeader onAddressPress={() => setShowAddressSheet(true)} onProfilePress={() => navigation.navigate("Account")} />
          </View>
          <View className="px-5 mb-2">
            <SearchBar />
          </View>
          <FlatList
            data={products}
            renderItem={renderSearchResult}
            keyExtractor={keyExtractor}
            initialNumToRender={5}
            windowSize={5}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={40}
            removeClippedSubviews={true}
            contentContainerStyle={{ padding: 16, paddingBottom: 80, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<SearchEmptyState searchQuery={searchQuery} />}
            keyboardShouldPersistTaps="handled"
          />
        </>
      ) : shouldShowSkeleton ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          <View className="px-5 mt-2">
            <AddressHeader onAddressPress={() => setShowAddressSheet(true)} onProfilePress={() => navigation.navigate("Account")} />
          </View>
          <View className="px-5 mb-2">
            <SearchBar />
          </View>
          <HomePageSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
          stickyHeaderIndices={[2]} // index 2 is CategoriesList wrapper
          refreshControl={
            <RefreshControl
              refreshing={pullRefreshing}
              onRefresh={handlePullRefresh}
              tintColor="#E23744"
              colors={["#E23744"]}
            />
          }
        >
          {/* Index 0: Header & Search */}
          <View className="bg-white">
            <View className="px-5 mt-2">
              <AddressHeader onAddressPress={() => setShowAddressSheet(true)} onProfilePress={() => navigation.navigate("Account")} />
            </View>
            <View className="px-5 pb-2">
              <SearchBar />
            </View>
          </View>

          {/* Index 1: Slideshow & Shop Status */}
          <View className="bg-white pb-4">
            {!shopStatus.isOpen && (
              <View className="mx-4 mt-3 rounded-2xl px-4 py-4" style={{ backgroundColor: "#1E1E2E" }}>
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
                    <Store size={16} color="#F87171" strokeWidth={2.5} />
                  </View>
                  <Text className="text-[15px] font-bold text-white">Shop is currently closed</Text>
                </View>
                <Text className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {shopStatus.message || "We'll be back soon!"}
                </Text>
                {shopStatus.reopenAt ? (
                  <Text className="text-[12px] font-semibold mt-1" style={{ color: "#A5B4FC" }}>
                    Reopen at: {shopStatus.reopenAt}
                  </Text>
                ) : null}
              </View>
            )}

            {isRefreshing && error ? (
              <View className="px-4 mt-2 flex-row items-center">
                <ActivityIndicator size="small" color="#E23744" />
                <Text className="ml-2 text-xs text-[#93959F]">Reconnecting catalog...</Text>
              </View>
            ) : null}

            <View className="mt-4">
              <Slideshow />
            </View>
          </View>

          {/* Index 2: Sticky Categories */}
          <View className="bg-white pt-2 pb-3 shadow-sm z-10 border-b border-gray-50">
            <View className="px-4">
              <CategoriesList />
            </View>
          </View>

          {/* Index 3+: Content below categories */}
          <View className="bg-[#F8F9FA] pt-6">
            <View className="px-4 mb-2">
              <HomePageBanner />
            </View>
            
            {/* Personalized Section: Top Picks */}
            {products && products.length > 0 && (
              <View className="mt-6 mb-4">
                <View className="px-5 mb-5 flex-row justify-between items-center">
                  <View>
                    <Text className="text-[20px] font-extrabold text-[#1C1C1C] tracking-tight">Top Picks For You</Text>
                    <Text className="text-[13px] text-[#93959F] mt-1 font-medium">Curated based on your preferences</Text>
                  </View>
                </View>
                <View className="bg-white border-t border-gray-50">
                  {products.slice(0, 3).map((item) => (
                    <ProductCard 
                      key={item.product_id?.toString()} 
                      product={item} 
                      onAddToCart={() => {}} 
                    />
                  ))}
                </View>
              </View>
            )}
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

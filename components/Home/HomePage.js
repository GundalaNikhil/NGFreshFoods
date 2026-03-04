import { ActivityIndicator, SafeAreaView, ScrollView, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useAddress } from "../../hooks/useAddress";
import AddressHeader from "./AddressHeader";
import CategoriesList from "./Categories/CategoriesList";
import HomePageBanner from "./HomePageBanner";
import SearchBar from "./SearchBar/SearchBar";
import Slideshow from "./Slideshow/Slideshow";
import AddressSelectionSheet from "./AddressSelectionSheet";
import AddAddressModal from "./AddAddressModal";

const HomePage = () => {
  const { loading, error } = useProducts();
  const { refreshAddresses, addAddress } = useAddress();
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

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
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <View className="px-4 mt-2">
          <AddressHeader onAddressPress={() => setShowAddressSheet(true)} />
        </View>
        <View className="px-4 mt-3">
          <SearchBar />
        </View>
        {/* <View className="px-4 mt-2">
          <View className="self-start bg-[#e9f2df] rounded-full px-3 py-1 flex-row items-center">
            <Clock3 size={11} color="#3f6212" />
            <Text className="ml-1 text-[10px] text-[#3f6212] font-semibold">
              Delivery in 25-35 mins
            </Text>
          </View>
        </View> */}

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

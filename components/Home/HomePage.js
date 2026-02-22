import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import AddressHeader from "./AddressHeader";
import CategoriesList from "./Categories/CategoriesList";
import HomePageBanner from "./HomePageBanner";
import SearchBar from "./SearchBar/SearchBar";
import Slideshow from "./Slideshow/Slideshow";

const HomePage = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View className="px-4">
          <View className="mt-1">
            <AddressHeader />
          </View>
          <View className="mt-2">
            <SearchBar />
          </View>
          <View className="mt-3">
            <Slideshow />
          </View>
          <View className="mt-5">
            <CategoriesList />
          </View>
          <View className="mt-5">
            <HomePageBanner />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;

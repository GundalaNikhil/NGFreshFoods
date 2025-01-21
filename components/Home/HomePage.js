import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
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
          <View className="mt-4">
            <SearchBar />
          </View>
          <View className="mt-4">
            <Slideshow />
          </View>
          <View className="mt-6">
            <CategoriesList />
          </View>
          <View>
            <HomePageBanner />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;

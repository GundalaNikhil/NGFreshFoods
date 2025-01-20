import React from "react";
import { SafeAreaView, View } from "react-native";
import CategoriesList from "./Categories/CategoriesList";
import SearchBar from "./SearchBar/SearchBar";
import Slideshow from "./Slideshow/Slideshow";

const HomePage = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        <View className="mt-4">
          <SearchBar />
        </View>
        <View className="mt-4">
          <Slideshow />
        </View>
        <View className="mt-6">
          <CategoriesList />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomePage;

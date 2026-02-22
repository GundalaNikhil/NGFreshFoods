import React from "react";
import { Clock3 } from "lucide-react-native";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Text } from "react-native";
import AddressHeader from "./AddressHeader";
import CategoriesList from "./Categories/CategoriesList";
import HomePageBanner from "./HomePageBanner";
import SearchBar from "./SearchBar/SearchBar";
import Slideshow from "./Slideshow/Slideshow";

const HomePage = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#f3f7ef]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <View className="px-4 mt-2">
          <AddressHeader />
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
    </SafeAreaView>
  );
};

export default HomePage;

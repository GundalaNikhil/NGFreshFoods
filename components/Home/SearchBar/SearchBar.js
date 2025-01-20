import { Search } from "lucide-react-native";
import React from "react";
import { TextInput, View } from "react-native";

const SearchBar = () => {
  return (
    <View className="flex-row items-center bg-gray-100 px-4 py-3 rounded-full shadow-sm">
      <Search size={20} color="#8492A6" />
      <TextInput
        className="flex-1 ml-2 text-gray-700 text-base"
        placeholder="Search for any delicious product"
        placeholderTextColor="#8492A6"
      />
    </View>
  );
};

export default SearchBar;

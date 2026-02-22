import { Mic, Search } from "lucide-react-native";
import React from "react";
import { TextInput, View } from "react-native";

const SearchBar = () => {
  return (
    <View className="flex-row items-center bg-gray-100/70 px-4 py-1.5 rounded-xl border border-gray-200/50">
      <Search size={16} color="#E23744" strokeWidth={2.5} />
      <TextInput
        className="flex-1 ml-2.5 text-gray-800 text-[13px] font-medium"
        placeholder="Search for 'Chicken Breast'"
        placeholderTextColor="#9ca3af"
      />
      <View className="w-[1px] h-4 bg-gray-300 mx-2" />
      <Mic size={16} color="#E23744" strokeWidth={2.5} />
    </View>
  );
};

export default SearchBar;

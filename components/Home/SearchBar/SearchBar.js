import { Mic, Search } from "lucide-react-native";
import React from "react";
import { TextInput, View } from "react-native";

const SearchBar = () => {
  return (
    <View className="flex-row items-center bg-white px-4 py-1.5 rounded-2xl border border-[#dce6d2]">
      <Search size={16} color="#3f6212" strokeWidth={2.4} />
      <TextInput
        className="flex-1 ml-2.5 text-[#1f2937] text-[12px] font-medium py-0 h-7"
        placeholder="Search chicken, eggs, cuts"
        placeholderTextColor="#94a3b8"
        includeFontPadding={false}
        textAlignVertical="center"
      />
      <View className="w-[1px] h-4 bg-[#d1d5db] mx-2" />
      <Mic size={16} color="#3f6212" strokeWidth={2.4} />
    </View>
  );
};

export default SearchBar;

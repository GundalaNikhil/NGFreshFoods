import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const CategoryItem = ({ title, image, itemSize, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{ width: itemSize }}
      className="bg-white border border-[#dce6d2] rounded-2xl p-2.5 mr-3"
    >
      <View
        className="rounded-xl overflow-hidden bg-[#eef4e7]"
        style={{ height: itemSize - 12 }}
      >
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: "100%",
          }}
          className="rounded-xl"
        />
      </View>
      <Text
        className="mt-2.5 text-center font-bold text-[#334155] text-xs"
        numberOfLines={1}
      >
        {title}
      </Text>
      <View className="mt-1 items-center">
        <Text className="text-[10px] text-[#3f6212] font-semibold">
          View collection
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryItem;

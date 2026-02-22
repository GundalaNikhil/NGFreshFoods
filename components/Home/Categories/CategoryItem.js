import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const CategoryItem = ({ title, image, itemSize, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{ width: itemSize }}
      className="bg-white border border-gray-200 rounded-2xl p-2 mr-3"
    >
      <View className="rounded-xl overflow-hidden bg-gray-100" style={{ height: itemSize - 16 }}>
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: "100%",
          }}
          className="rounded-xl"
        />
      </View>
      <Text className="mt-2 text-center font-semibold text-gray-900 text-xs" numberOfLines={1}>
        {title}
      </Text>
      <View className="mt-1 items-center">
        <Text className="text-[10px] text-emerald-600 font-semibold">Shop now</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryItem;

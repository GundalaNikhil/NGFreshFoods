import React from "react";
import { Image, Pressable, Text, View } from "react-native";

const CategoryItem = ({ title, image, isFirst, isLast }) => {
  return (
    <Pressable
      className={`items-center ${isFirst ? "ml-2" : "ml-4"} ${
        isLast ? "mr-2" : ""
      }`}
    >
      <View className="mx-2 shadow-sm bg-white rounded-full">
        <Image
          source={{ uri: image }}
          className="w-28 h-28 rounded-full border-2 border-gray-200"
          resizeMode="cover"
        />
      </View>
      <Text className="mt-2 text-lg font-semibold text-gray-700">{title}</Text>
    </Pressable>
  );
};

export default CategoryItem;

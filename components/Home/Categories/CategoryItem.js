import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import CachedImage from "../../ResuableComponents/CachedImage";

const CategoryItem = ({ title, image, itemSize, isLast, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{ width: itemSize, marginRight: isLast ? 0 : 12 }}
      className="bg-white border border-[#dce6d2] rounded-2xl p-2.5"
    >
      <View
        className="rounded-xl overflow-hidden bg-[#eef4e7]"
        style={{ height: itemSize - 12 }}
      >
        <CachedImage
          source={image}
          contentFit="cover"
          transition={200}
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

export default React.memo(CategoryItem);

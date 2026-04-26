import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import CachedImage from "../../ResuableComponents/CachedImage";

const CategoryItem = ({ title, image, itemSize, isLast, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{ 
        width: itemSize, 
        marginRight: isLast ? 0 : 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
      className="bg-white rounded-2xl p-2.5"
    >
      <View
        className="rounded-xl overflow-hidden bg-[#F5F5F5]"
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
        className="mt-2.5 text-center font-bold text-[#1C1C1C] text-xs"
        numberOfLines={1}
      >
        {title}
      </Text>
      <View className="mt-1 items-center">
        <Text className="text-[10px] text-[#E23744] font-semibold">
          View all →
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(CategoryItem);

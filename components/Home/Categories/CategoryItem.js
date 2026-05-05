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
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
      className="bg-white rounded-[24px] p-3 border border-gray-100"
    >
      <View
        className="rounded-2xl overflow-hidden bg-[#F8F9FA]"
        style={{ height: itemSize * 0.8 }}
      >
        <CachedImage
          source={image}
          contentFit="cover"
          transition={200}
          style={{
            width: "100%",
            height: "100%",
          }}
          className="rounded-2xl"
        />
      </View>
      <Text
        className="mt-3 text-center font-extrabold text-[#1C1C1C] text-[13px]"
        numberOfLines={1}
      >
        {title}
      </Text>
      <View className="mt-1 items-center">
        <Text className="text-[10px] text-[#E23744] font-bold tracking-wide uppercase">
          Explore
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(CategoryItem);

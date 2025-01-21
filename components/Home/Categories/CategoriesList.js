import React from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import CategoryItem from "./CategoryItem";

const categories = [
  {
    id: 1,
    title: "Chicken",
    image:
      "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513763/ffw/Chicken%20Boneless%20Family%20Pack/kp19kip3zpb0uc20tkoa.jpg",
  },
  {
    id: 2,
    title: "Mutton",
    image:
      "https://res.cloudinary.com/djv3mrzk2/image/upload/v1737391536/goat-rann-cut_1_fuxtwn.jpg",
  },
  {
    id: 3,
    title: "Eggs",
    image:
      "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513888/ffw/Farm%20Fresh%20Eggs%20%28Pack%20of%2012%29/g8hwht5nvy5vytuhbomy.jpg",
  },
];

const CategoriesList = () => {
  const screenWidth = Dimensions.get("window").width;
  const itemSize = screenWidth / 3 - 20; // Calculate item size dynamically

  return (
    <View className="px-4">
      <Text className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Explore Categories
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
          justifyContent: "space-around",
        }}
      >
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            title={category.title}
            image={category.image}
            itemSize={itemSize}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoriesList;

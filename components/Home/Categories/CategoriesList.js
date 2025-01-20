import React from "react";
import { ScrollView, Text, View } from "react-native";
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
      "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513888/ffw/Farm%20Fresh%20Eggs%20%28Pack%20of%2012%29/sdpexnfwbawpkdo2ad8b.jpg",
  },
];

const CategoriesList = () => {
  return (
    <View className="items-center ">
      <Text className="text-2xl font-bold mt-6 mb-4 text-center text-gray-800">
        Explore Categories
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="py-2"
      >
        {categories.map((category, index) => (
          <CategoryItem
            key={category.id}
            title={category.title}
            image={category.image}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoriesList;

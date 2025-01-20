import React, { useEffect } from "react";
import { Animated, Image, Text, View } from "react-native";

const CategoryItem = ({ title, image }) => {
  const scaleAnim = new Animated.Value(0.9);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pressAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }, { scale: pressAnim }],
        width: 100,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 8,
      }}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <View
        className="rounded-full overflow-hidden bg-gray-100 shadow-sm"
        style={{
          width: 80,
          height: 80,
          borderWidth: 2,
          borderColor: "#f3f4f6",
        }}
      >
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: "100%",
          }}
          className="rounded-full"
        />
      </View>
      <Text className="mt-3 text-center font-medium text-gray-800 text-sm">
        {title}
      </Text>
    </Animated.View>
  );
};

export default CategoryItem;

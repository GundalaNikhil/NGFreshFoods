import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, View } from "react-native";

const images = [
  "https://res.cloudinary.com/djv3mrzk2/image/upload/v1735914513/Banner1_aosc5m.png",
  "https://res.cloudinary.com/djv3mrzk2/image/upload/v1735914514/Banner2_wftiw1.png",
  "https://res.cloudinary.com/djv3mrzk2/image/upload/v1736013499/xPmFaNUa_mx6jks.jpg",
];

const Slideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = globalThis.setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500, // Half a second fade in
          useNativeDriver: true,
        }).start();
      });
    }, 5000); // Change image every 5 seconds

    return () => globalThis.clearInterval(timer);
  }, [fadeAnim]);

  return (
    <View className="h-52 px-4">
      <Animated.View
        className="w-full h-full overflow-hidden rounded-3xl border border-[#d6e2cb]"
        style={{ opacity: fadeAnim }}
      >
        <Image
          source={{ uri: images[currentIndex] }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </Animated.View>

      <View className="flex-row justify-center absolute bottom-4 w-full">
        {images.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${
              currentIndex === index ? "bg-[#f8fafc]" : "bg-white/45"
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default Slideshow;

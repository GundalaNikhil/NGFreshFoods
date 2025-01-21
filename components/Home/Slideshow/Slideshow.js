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
    const timer = setInterval(() => {
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

    return () => clearInterval(timer);
  }, []);

  return (
    <View className="h-48 px-4 py-2">
      <Animated.View
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ opacity: fadeAnim }}
      >
        <Image
          source={{ uri: images[currentIndex] }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </Animated.View>

      {/* Adding dot indicators to show current slide position */}
      <View className="flex-row justify-center mt-2 absolute bottom-4 w-full">
        {images.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${
              currentIndex === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default Slideshow;

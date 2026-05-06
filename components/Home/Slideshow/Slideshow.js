import React, { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { Image } from "expo-image";
import { normalizeImageUrl } from "../../../utils/imageUrl";

import cloudinaryUrls from "../../../assets/images/cloudinary_urls.json";

const images = [
  cloudinaryUrls.marketing_images.slideshow_banner_1,
  cloudinaryUrls.marketing_images.slideshow_banner_2,
  cloudinaryUrls.marketing_images.slideshow_banner_3,
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
        className="w-full h-full overflow-hidden rounded-2xl"
        style={{ opacity: fadeAnim, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}
      >
        <Image
          source={{ uri: normalizeImageUrl(images[currentIndex]) }}
          contentFit="cover"
          transition={200}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      </Animated.View>

      <View className="flex-row justify-center absolute bottom-4 w-full">
        {images.map((_, index) => (
          <View
            key={index}
            style={{
              height: 6,
              width: currentIndex === index ? 20 : 6,
              borderRadius: 3,
              marginHorizontal: 3,
              backgroundColor: currentIndex === index ? "#E23744" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default Slideshow;

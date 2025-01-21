import { ArrowRight } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const HomePageBanner = () => {
  const { width } = useWindowDimensions();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  const isSmallScreen = width < 360;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Dynamic text styles based on screen width
  const getTextStyles = () => {
    if (width < 360) {
      return "text-xs leading-3"; // Smallest screens
    } else if (width > 360 && width < 450) {
      return "text-sm leading-6"; // Medium screens
    }
    return "text-base leading-8"; // Large screens (original size)
  };

  const getHeaderTextStyles = () => {
    if (width < 400) {
      return "text-xl";
    } else if (width >= 400 && width < 450) {
      return "text-2xl";
    }
    return "text-3xl";
  };

  return (
    <View className="mt-6">
      <Text
        className={`text-center  font-bold ${getHeaderTextStyles()} text-gray-800 mb-4`}
      >
        From Nature's Heart to Your Table
      </Text>
      <View className="rounded-2xl overflow-hidden h-80">
        <ImageBackground
          source={{
            uri: "https://res.cloudinary.com/djv3mrzk2/image/upload/v1735914513/HomePageBanner_boohud.png",
          }}
          className="w-full h-full"
          resizeMode="cover"
        >
          <View className="flex-1 bg-black/30 p-6 justify-between">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text
                className={`text-white ${getHeaderTextStyles()} font-extrabold mb-2`}
              >
                Farm-Fresh Goodness
              </Text>
              <Text className={`text-white ${getTextStyles()} mb-6 w-1/2`}>
                Discover the pure taste of naturally raised poultry and
                farm-fresh eggs, carefully sourced from local farms that share
                our commitment to quality and sustainability.
              </Text>
            </Animated.View>
            <Pressable
              className="bg-white/90 py-3 px-6 rounded-full flex-row items-center justify-center space-x-2 self-start"
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Text className="text-black font-semibold">
                Browse Our Selection
              </Text>
              <ArrowRight size={18} color="black" />
            </Pressable>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

export default HomePageBanner;

import { ArrowRight, BadgeCheck, Leaf, ShieldCheck, Truck } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const HomePageBanner = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getTextStyles = () => {
    if (width < 360) {
      return "text-[11px] leading-4";
    } else if (width > 360 && width < 450) {
      return "text-xs leading-5";
    }
    return "text-sm leading-6";
  };

  const getHeaderTextStyles = () => {
    if (width < 400) {
      return "text-[22px]";
    } else if (width >= 400 && width < 450) {
      return "text-[25px]";
    }
    return "text-[28px]";
  };

  return (
    <View className="mt-1">
      <View className="items-center mb-4 px-2">
        <View className="bg-[#e9f2df] rounded-full px-3 py-1 mb-2.5">
          <Text className="text-[10px] tracking-[1px] font-semibold text-[#365314]">
            HANDPICKED QUALITY
          </Text>
        </View>
        <Text
          className={`text-center font-extrabold italic ${getHeaderTextStyles()} text-[#1f2937] leading-8`}
        >
          Sustainably Raised. Honestly Delivered.
        </Text>
        <Text className="text-center text-[#475569] text-xs mt-2 px-6 leading-5">
          Organic-first sourcing with transparent quality standards.
        </Text>
      </View>
      <View className="rounded-2xl overflow-hidden h-80">
        <ImageBackground
          source={{
            uri: "https://res.cloudinary.com/djv3mrzk2/image/upload/v1735914513/HomePageBanner_boohud.png",
          }}
          className="w-full h-full"
          resizeMode="cover"
        >
          <View className="flex-1 bg-[#1f2937]/55 p-5 justify-between">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <View className="self-start rounded-full px-3 py-1 bg-[#d9f99d] mb-3 flex-row items-center">
                <Leaf size={12} color="#365314" />
                <Text className="ml-1 text-[10px] font-bold text-[#365314]">
                  100% traceable farms
                </Text>
              </View>
              <Text className={`text-white ${getHeaderTextStyles()} font-extrabold mb-2`}>
                Better Meat, Better Mornings
              </Text>
              <Text className={`text-white ${getTextStyles()} mb-6 w-1/2`}>
                Naturally raised poultry and farm-fresh eggs from vetted
                partners focused on welfare, freshness, and clean handling.
              </Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-3">
                  <BadgeCheck size={14} color="#bef264" />
                  <Text className="text-[10px] text-white ml-1">No antibiotics</Text>
                </View>
                <View className="flex-row items-center mr-3">
                  <Truck size={14} color="#bef264" />
                  <Text className="text-[10px] text-white ml-1">Same-day slots</Text>
                </View>
                <View className="flex-row items-center">
                  <ShieldCheck size={14} color="#bef264" />
                  <Text className="text-[10px] text-white ml-1">Quality checked</Text>
                </View>
              </View>
            </Animated.View>
            <Pressable
              className="bg-[#f8fafc] py-3 px-5 rounded-full flex-row items-center justify-center self-start"
              onPress={() => navigation.navigate("Products")}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}
            >
              <Text className="text-[#1f2937] font-semibold mr-1">
                Browse Collection
              </Text>
              <ArrowRight size={18} color="#1f2937" />
            </Pressable>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

export default HomePageBanner;

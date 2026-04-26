import { ArrowRight, BadgeCheck, ShieldCheck, Truck, Zap } from "lucide-react-native";
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
        <View className="bg-[#FFF0F1] rounded-full px-3 py-1 mb-2.5">
          <Text className="text-[10px] tracking-[1px] font-semibold text-[#E23744]">
            FRESH GUARANTEE
          </Text>
        </View>
        <Text
          className={`text-center font-extrabold italic ${getHeaderTextStyles()} text-[#1C1C1C] leading-8`}
        >
          Farm to Fork. Unbelievably Fresh.
        </Text>
        <Text className="text-center text-[#686B78] text-xs mt-2 px-6 leading-5">
          100% fresh meat & eggs. Sourced daily, delivered fast.
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
          <View className="flex-1 bg-[#1C1C1C]/60 p-5 justify-between">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <View className="self-start rounded-full px-3 py-1 bg-[#FC8019] mb-3 flex-row items-center">
                <Zap size={12} color="#fff" />
                <Text className="ml-1 text-[10px] font-bold text-white">
                  Lightning Fast Delivery
                </Text>
              </View>
              <Text className={`text-white ${getHeaderTextStyles()} font-extrabold mb-2`}>
                Better Meat, Better Mornings
              </Text>
              <Text className={`text-white ${getTextStyles()} mb-6 w-1/2`}>
                Naturally raised poultry and farm-fresh eggs. Quality you can trust.
              </Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-3">
                  <BadgeCheck size={14} color="#FC8019" />
                  <Text className="text-[10px] text-white ml-1">No antibiotics</Text>
                </View>
                <View className="flex-row items-center mr-3">
                  <Truck size={14} color="#FC8019" />
                  <Text className="text-[10px] text-white ml-1">Same-day slots</Text>
                </View>
                <View className="flex-row items-center">
                  <ShieldCheck size={14} color="#FC8019" />
                  <Text className="text-[10px] text-white ml-1">Quality checked</Text>
                </View>
              </View>
            </Animated.View>
            <Pressable
              className="bg-[#E23744] py-3 px-5 rounded-full flex-row items-center justify-center self-start"
              onPress={() => navigation.navigate("Products")}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  shadowColor: "#E23744",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
            >
              <Text className="text-white font-bold mr-1">
                Order Now
              </Text>
              <ArrowRight size={18} color="#fff" />
            </Pressable>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

export default HomePageBanner;

import { ChevronDown, MapPin, Search } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useAddress } from "../../hooks/useAddress";
import { useRecoilValue } from "recoil";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const AddressHeader = ({ onAddressPress, onProfilePress, onSearchPress }) => {
  const { selectedAddress } = useAddress();
  const profile = useRecoilValue(profileAtom);
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Dynamic avatar initial from user's first name
  const userInitial = profile?.firstName
    ? profile.firstName.substring(0, 1).toUpperCase()
    : "U";

  // Subtle pulse animation for avatar ring
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const locationName =
    selectedAddress?.label === "HOME" ||
    selectedAddress?.label === "WORK" ||
    selectedAddress?.label === "OTHER"
      ? selectedAddress.label.charAt(0).toUpperCase() +
        selectedAddress.label.slice(1).toLowerCase()
      : selectedAddress?.label || "Select Address";

  return (
    <View className="flex-row items-center justify-between py-1.5 mb-2">
      {/* LEFT: Address */}
      <TouchableOpacity
        className="flex-row items-center flex-1"
        onPress={onAddressPress}
        activeOpacity={0.7}
      >
        <View
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(226,55,68,0.08)" }}
        >
          <MapPin size={18} color="#E23744" strokeWidth={2.5} />
        </View>
        <View className="ml-2 flex-1">
          <View className="flex-row items-center">
            <Text className="text-[16px] font-black text-[#1C1C1C] tracking-tight">
              {locationName}
            </Text>
            <ChevronDown
              size={16}
              color="#1C1C1C"
              strokeWidth={2.5}
              style={{ marginLeft: 2 }}
            />
          </View>
          <Text
            className="text-[11.5px] text-[#686B78] mt-0.5"
            numberOfLines={1}
          >
            {selectedAddress?.street || "Add your delivery address"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* RIGHT: Search & Profile */}
      <View className="flex-row items-center">
        {/* Search Button — Glassmorphic pill */}
        <TouchableOpacity
          onPress={onSearchPress}
          activeOpacity={0.75}
          style={{
            shadowColor: "#E23744",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View
            className="flex-row items-center rounded-full px-3.5 py-2"
            style={{
              backgroundColor: "rgba(226,55,68,0.06)",
              borderWidth: 1,
              borderColor: "rgba(226,55,68,0.1)",
            }}
          >
            <Search size={15} color="#E23744" strokeWidth={2.5} />
            <Text className="text-[11px] text-[#9CA3AF] font-semibold ml-1.5">
              Search
            </Text>
          </View>
        </TouchableOpacity>

        {/* Avatar — Gradient ring with user initial */}
        <TouchableOpacity
          onPress={onProfilePress}
          activeOpacity={0.75}
          style={{ marginLeft: 10 }}
        >
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
              borderRadius: 22,
              padding: 2,
            }}
          >
            <LinearGradient
              colors={["#E23744", "#FC8019", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                padding: 2,
              }}
            >
              <View
                className="items-center justify-center"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#FFF8F0",
                }}
              >
                <Text
                  style={{
                    color: "#E23744",
                    fontWeight: "900",
                    fontSize: 15,
                    letterSpacing: 0.5,
                  }}
                >
                  {userInitial}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddressHeader;

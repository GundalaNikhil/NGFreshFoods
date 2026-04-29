import React, { useEffect } from "react";
import { View } from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

/**
 * Pulsing skeleton placeholder.
 * Variants: "card", "stat", "list-item", "text", "circle"
 */
const SkeletonLoader = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style = {},
  variant,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Variant presets
  const presets = {
    card: { width: "100%", height: 100, borderRadius: 16 },
    stat: { width: "48%", height: 90, borderRadius: 16 },
    "list-item": { width: "100%", height: 72, borderRadius: 14 },
    text: { width: "60%", height: 14, borderRadius: 6 },
    circle: { width: 44, height: 44, borderRadius: 22 },
  };

  const preset = variant ? presets[variant] || {} : {};

  return (
    <Reanimated.View
      style={[
        {
          backgroundColor: "#E8E8EE",
          width: preset.width || width,
          height: preset.height || height,
          borderRadius: preset.borderRadius || borderRadius,
        },
        style,
        animatedStyle,
      ]}
    />
  );
};

/**
 * Dashboard skeleton: 4 stat cards + list items
 */
export const DashboardSkeleton = () => (
  <View style={{ padding: 16 }}>
    <SkeletonLoader width="40%" height={22} borderRadius={6} style={{ marginBottom: 20 }} />
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
      <SkeletonLoader variant="stat" />
      <SkeletonLoader variant="stat" />
    </View>
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
      <SkeletonLoader variant="stat" />
      <SkeletonLoader variant="stat" />
    </View>
    <SkeletonLoader width="30%" height={16} borderRadius={6} style={{ marginBottom: 12 }} />
    {[1, 2, 3].map((i) => (
      <SkeletonLoader key={i} variant="list-item" style={{ marginBottom: 10 }} />
    ))}
  </View>
);

/**
 * List skeleton: multiple list items
 */
export const ListSkeleton = ({ count = 5 }) => (
  <View style={{ padding: 16 }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonLoader key={i} variant="list-item" style={{ marginBottom: 10 }} />
    ))}
  </View>
);

export default SkeletonLoader;

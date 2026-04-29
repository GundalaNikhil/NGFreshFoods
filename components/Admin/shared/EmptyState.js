import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Inbox } from "lucide-react-native";

/**
 * Reusable empty state with icon, title, subtitle, and optional CTA button.
 */
const EmptyState = ({
  icon: Icon = Inbox,
  iconColor = "#C7C7CC",
  title = "Nothing here yet",
  subtitle = "",
  ctaLabel,
  onCtaPress,
}) => (
  <View
    style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      paddingHorizontal: 40,
    }}
  >
    <View
      style={{
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: "#F2F2F7",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
      }}
    >
      <Icon size={32} color={iconColor} strokeWidth={1.5} />
    </View>
    <Text
      style={{
        fontSize: 17,
        fontWeight: "600",
        color: "#3C3C43",
        textAlign: "center",
        marginBottom: 6,
      }}
    >
      {title}
    </Text>
    {subtitle ? (
      <Text
        style={{
          fontSize: 14,
          color: "#8E8E93",
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        {subtitle}
      </Text>
    ) : null}
    {ctaLabel && onCtaPress && (
      <TouchableOpacity
        onPress={onCtaPress}
        style={{
          marginTop: 20,
          backgroundColor: "#2C2C2E",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 14,
        }}
        activeOpacity={0.8}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>
          {ctaLabel}
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

export default EmptyState;

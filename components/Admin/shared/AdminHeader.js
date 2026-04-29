import React from "react";
import { View, Text, TouchableOpacity, Platform, StatusBar } from "react-native";
import { ArrowLeft } from "lucide-react-native";

const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0;

/**
 * Consistent admin header with back button, title, optional right action.
 */
const AdminHeader = ({
  title,
  subtitle,
  onBack,
  rightAction,
  rightIcon: RightIcon,
  rightLabel,
  showBack = true,
}) => (
  <View
    style={{
      paddingTop: onBack ? 12 : STATUSBAR_HEIGHT + 8,
      paddingBottom: 10,
      paddingHorizontal: 20,
      backgroundColor: "#F8F8FC",
      borderBottomWidth: 1,
      borderBottomColor: "#EEEFF3",
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {showBack && onBack && (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "#EEEFF3",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <ArrowLeft size={18} color="#3C3C43" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#1C1C1E",
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 1 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightAction && (
        <TouchableOpacity
          onPress={rightAction}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#2C2C2E",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 12,
          }}
          activeOpacity={0.8}
        >
          {RightIcon && <RightIcon size={16} color="#FFFFFF" strokeWidth={2.5} />}
          {rightLabel && (
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: "600",
                marginLeft: RightIcon ? 6 : 0,
              }}
            >
              {rightLabel}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default AdminHeader;

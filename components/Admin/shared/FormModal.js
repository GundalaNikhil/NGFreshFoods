import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { X } from "lucide-react-native";

/**
 * Reusable bottom sheet modal for Create/Edit forms.
 * Slides up from bottom with backdrop.
 */
const FormModal = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = "Save",
  submitting = false,
  submitDisabled = false,
  destructive = false,
}) => {
  const translateY = useSharedValue(600);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(600, { duration: 280, easing: Easing.in(Easing.cubic) });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <Reanimated.View style={[{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Reanimated.View>

        {/* Sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, justifyContent: "flex-end", pointerEvents: "box-none" }}
        >
          <Reanimated.View
            style={[
              {
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: "85%",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 20,
              },
              sheetStyle,
            ]}
          >
            {/* Handle */}
            <View style={{ alignItems: "center", paddingTop: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#D1D1D6",
                }}
              />
            </View>

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#F2F2F7",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#1C1C1E" }}>{title}</Text>
                {subtitle ? (
                  <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>{subtitle}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F2F2F7",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} color="#8E8E93" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {/* Submit */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: Platform.OS === "ios" ? 34 : 20,
                borderTopWidth: 1,
                borderTopColor: "#F2F2F7",
              }}
            >
              <TouchableOpacity
                onPress={onSubmit}
                disabled={submitting || submitDisabled}
                style={{
                  backgroundColor: destructive
                    ? "#FF3B30"
                    : submitDisabled
                      ? "#D1D1D6"
                      : "#2C2C2E",
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: submitting ? 0.7 : 1,
                }}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
                    {submitLabel}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Reanimated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

/**
 * Styled form field wrapper
 */
export const FormField = ({ label, required, children, style = {} }) => (
  <View style={[{ marginBottom: 16 }, style]}>
    <Text style={{ fontSize: 13, fontWeight: "600", color: "#3C3C43", marginBottom: 6 }}>
      {label}
      {required && <Text style={{ color: "#FF3B30" }}> *</Text>}
    </Text>
    {children}
  </View>
);

/**
 * Styled text input for forms
 */
export const FormInput = ({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
  style = {},
}) => (
  <View
    style={[
      {
        backgroundColor: "#F8F8FC",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#EEEFF3",
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === "ios" ? 12 : 8,
      },
      multiline && { minHeight: 80, paddingTop: 12 },
      style,
    ]}
  >
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#C7C7CC"
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
      style={[
        {
          fontSize: 15,
          color: "#1C1C1E",
          fontWeight: "500",
        },
        multiline && { textAlignVertical: "top" },
      ]}
    />
  </View>
);

export default FormModal;

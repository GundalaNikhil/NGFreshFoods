import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  BackHandler,
} from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { ArrowLeft, Store, Clock, MessageSquare, Truck, CheckCircle } from "lucide-react-native";
import { fetchShopSettings, updateShopSettings } from "../../services/bff/adminBff";
import AdminHeader from "./shared/AdminHeader";

const AdminShopSettings = ({ onBack }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [edited, setEdited] = useState({});

  // Save button animation
  const saveScale = useSharedValue(1);
  const checkOpacity = useSharedValue(0);

  const saveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

  const loadSettings = useCallback(async () => {
    try {
      const result = await fetchShopSettings();
      setSettings(result || {});
      setEdited(result || {});
    } catch (e) {
      console.warn("Settings error:", e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const isOpen = edited.shop_open === "true";
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(edited);

  // Unsaved changes warning on back
  const handleBack = () => {
    if (hasChanges) {
      Alert.alert("Unsaved Changes", "You have unsaved changes. Discard them?", [
        { text: "Keep Editing" },
        { text: "Discard", style: "destructive", onPress: onBack },
      ]);
    } else {
      onBack?.();
    }
  };

  const handleToggleShop = (val) => {
    setEdited((prev) => ({ ...prev, shop_open: val ? "true" : "false" }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const result = await updateShopSettings(edited);
      setSettings(result || edited);
      setEdited(result || edited);

      // Animate success
      setSaved(true);
      saveScale.value = withSequence(
        withSpring(0.95, { damping: 10 }),
        withSpring(1, { damping: 8 })
      );
      checkOpacity.value = withTiming(1, { duration: 300 });

      // Reset after 2s
      setTimeout(() => {
        setSaved(false);
        checkOpacity.value = withTiming(0, { duration: 200 });
      }, 2000);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8F8FC", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#3C3C43" />
        <Text style={{ fontSize: 13, color: "#8E8E93", marginTop: 12 }}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8FC" }}>
      <AdminHeader title="Shop Settings" subtitle="Store configuration" onBack={handleBack} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Shop Open/Close Card */}
        <Reanimated.View entering={FadeInDown.delay(0).duration(300)}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: isOpen ? "#E8F5E9" : "#FFEBEE",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Store size={24} color={isOpen ? "#2E7D32" : "#C62828"} strokeWidth={2} />
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#1C1C1E" }}>
                    Shop is {isOpen ? "Open" : "Closed"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>
                    {isOpen ? "Customers can place orders" : "Orders are paused"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isOpen}
                onValueChange={handleToggleShop}
                trackColor={{ false: "#FFCDD2", true: "#C8E6C9" }}
                thumbColor={isOpen ? "#2E7D32" : "#C62828"}
              />
            </View>
          </View>
        </Reanimated.View>

        {/* Timings Card */}
        <Reanimated.View entering={FadeInDown.delay(80).duration(300)}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Clock size={18} color="#3C3C43" strokeWidth={2} />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#1C1C1E", marginLeft: 8 }}>
                Operating Hours
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#8E8E93", marginBottom: 6 }}>
                  Open Time
                </Text>
                <TextInput
                  value={edited.shop_open_time || ""}
                  onChangeText={(val) => setEdited((prev) => ({ ...prev, shop_open_time: val }))}
                  placeholder="08:00"
                  placeholderTextColor="#C7C7CC"
                  style={{
                    backgroundColor: "#F8F8FC",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: Platform.OS === "ios" ? 12 : 8,
                    fontSize: 15,
                    color: "#1C1C1E",
                    fontWeight: "600",
                    borderWidth: 1,
                    borderColor: "#EEEFF3",
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#8E8E93", marginBottom: 6 }}>
                  Close Time
                </Text>
                <TextInput
                  value={edited.shop_close_time || ""}
                  onChangeText={(val) => setEdited((prev) => ({ ...prev, shop_close_time: val }))}
                  placeholder="22:00"
                  placeholderTextColor="#C7C7CC"
                  style={{
                    backgroundColor: "#F8F8FC",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: Platform.OS === "ios" ? 12 : 8,
                    fontSize: 15,
                    color: "#1C1C1E",
                    fontWeight: "600",
                    borderWidth: 1,
                    borderColor: "#EEEFF3",
                  }}
                />
              </View>
            </View>

            {/* Closed Message */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <MessageSquare size={14} color="#8E8E93" strokeWidth={2} />
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#8E8E93", marginLeft: 6 }}>
                Closed Message
              </Text>
            </View>
            <TextInput
              value={edited.shop_closed_message || ""}
              onChangeText={(val) => setEdited((prev) => ({ ...prev, shop_closed_message: val }))}
              placeholder="We're closed! Back again tomorrow at 8:00 AM"
              placeholderTextColor="#C7C7CC"
              multiline
              numberOfLines={2}
              style={{
                backgroundColor: "#F8F8FC",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 14,
                color: "#1C1C1E",
                fontWeight: "500",
                textAlignVertical: "top",
                minHeight: 60,
                borderWidth: 1,
                borderColor: "#EEEFF3",
              }}
            />

            {/* Reopen At */}
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#8E8E93", marginTop: 16, marginBottom: 6 }}>
              Specific Reopen Time (optional)
            </Text>
            <TextInput
              value={edited.reopen_at || ""}
              onChangeText={(val) => setEdited((prev) => ({ ...prev, reopen_at: val }))}
              placeholder="e.g. 9:00 AM tomorrow"
              placeholderTextColor="#C7C7CC"
              style={{
                backgroundColor: "#F8F8FC",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: Platform.OS === "ios" ? 12 : 8,
                fontSize: 14,
                color: "#1C1C1E",
                fontWeight: "500",
                borderWidth: 1,
                borderColor: "#EEEFF3",
              }}
            />
          </View>
        </Reanimated.View>

        {/* Delivery Config Card */}
        <Reanimated.View entering={FadeInDown.delay(160).duration(300)}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Truck size={18} color="#3C3C43" strokeWidth={2} />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#1C1C1E", marginLeft: 8 }}>
                Delivery Config
              </Text>
            </View>

            {[
              { key: "delivery_fee", label: "Delivery Fee (₹)", placeholder: "30" },
              { key: "free_delivery_threshold", label: "Free Delivery Above (₹)", placeholder: "499" },
              { key: "min_order_amount", label: "Min Order Amount (₹)", placeholder: "100" },
            ].map((field) => (
              <View
                key={field.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <Text style={{ fontSize: 14, color: "#3C3C43", fontWeight: "500", flex: 1 }}>
                  {field.label}
                </Text>
                <TextInput
                  value={edited[field.key] || ""}
                  onChangeText={(val) =>
                    setEdited((prev) => ({ ...prev, [field.key]: val }))
                  }
                  keyboardType="number-pad"
                  placeholder={field.placeholder}
                  placeholderTextColor="#C7C7CC"
                  style={{
                    backgroundColor: "#F8F8FC",
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: Platform.OS === "ios" ? 10 : 6,
                    fontSize: 15,
                    color: "#1C1C1E",
                    fontWeight: "700",
                    width: 90,
                    textAlign: "center",
                    borderWidth: 1,
                    borderColor: "#EEEFF3",
                  }}
                />
              </View>
            ))}
          </View>
        </Reanimated.View>
      </ScrollView>

      {/* Floating Save Button */}
      {hasChanges && (
        <Reanimated.View
          entering={FadeIn.duration(200)}
          style={[
            {
              position: "absolute",
              bottom: Platform.OS === "ios" ? 100 : 90,
              left: 16,
              right: 16,
            },
            saveStyle,
          ]}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saved ? "#2E7D32" : "#2C2C2E",
              paddingVertical: 15,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              opacity: saving ? 0.7 : 1,
            }}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : saved ? (
              <>
                <Reanimated.View style={checkStyle}>
                  <CheckCircle size={18} color="#FFFFFF" strokeWidth={2.5} />
                </Reanimated.View>
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700", marginLeft: 8 }}>
                  Saved!
                </Text>
              </>
            ) : (
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </Reanimated.View>
      )}
    </View>
  );
};

export default AdminShopSettings;

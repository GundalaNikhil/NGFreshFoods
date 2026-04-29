import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
} from "react-native-reanimated";
import { ArrowLeft, Send, CheckCircle, Bell, Users, ShoppingBag, UserX } from "lucide-react-native";
import { broadcastNotification } from "../../services/bff/adminBff";
import AdminHeader from "./shared/AdminHeader";

const AUDIENCES = [
  { key: "ALL_USERS", label: "All Users", icon: Users, description: "Every registered user" },
  { key: "USERS_WITH_ACTIVE_ORDERS", label: "Active Orders", icon: ShoppingBag, description: "Users with pending orders" },
  { key: "USERS_WITHOUT_ORDERS", label: "No Orders Yet", icon: UserX, description: "Users who haven't ordered" },
];

const MAX_TITLE_LENGTH = 60;
const MAX_BODY_LENGTH = 200;

const AdminBroadcast = ({ onBack }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] = useState("ALL_USERS");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Success animation
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Missing fields", "Please fill in both title and body.");
      return;
    }

    const audienceLabel = AUDIENCES.find((a) => a.key === audienceType)?.label;
    Alert.alert("Confirm Broadcast", `Send notification to ${audienceLabel}?`, [
      { text: "Cancel" },
      {
        text: "Send",
        onPress: async () => {
          setSending(true);
          try {
            const result = await broadcastNotification({
              title: title.trim(),
              body: body.trim(),
              audienceType,
            });
            if (result.error) {
              Alert.alert("Error", result.error);
            } else {
              setSent(true);
              // Animate success
              successOpacity.value = withTiming(1, { duration: 300 });
              successScale.value = withSequence(
                withSpring(1.2, { damping: 8, stiffness: 150 }),
                withSpring(1, { damping: 12, stiffness: 120 })
              );
            }
          } catch (e) {
            Alert.alert("Error", e?.message || "Broadcast failed");
          } finally {
            setSending(false);
          }
        },
      },
    ]);
  };

  const handleReset = () => {
    setTitle("");
    setBody("");
    setAudienceType("ALL_USERS");
    setSent(false);
    successScale.value = 0;
    successOpacity.value = 0;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8FC" }}>
      <AdminHeader title="Broadcast" subtitle="Push notifications" onBack={onBack} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {sent ? (
          /* ── Success State ── */
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Reanimated.View style={successStyle}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  backgroundColor: "#E8F5E9",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <CheckCircle size={40} color="#2E7D32" strokeWidth={2} />
              </View>
            </Reanimated.View>
            <Reanimated.View entering={FadeIn.delay(400).duration(300)}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#1C1C1E",
                  textAlign: "center",
                }}
              >
                Broadcast Sent!
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#8E8E93",
                  textAlign: "center",
                  marginTop: 8,
                  lineHeight: 20,
                }}
              >
                Your notification has been dispatched to{"\n"}
                {AUDIENCES.find((a) => a.key === audienceType)?.label}
              </Text>
              <TouchableOpacity
                onPress={handleReset}
                style={{
                  marginTop: 28,
                  backgroundColor: "#2C2C2E",
                  paddingHorizontal: 28,
                  paddingVertical: 13,
                  borderRadius: 14,
                  alignSelf: "center",
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>
                  Send Another
                </Text>
              </TouchableOpacity>
            </Reanimated.View>
          </View>
        ) : (
          /* ── Form ── */
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* Audience Selection */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#8E8E93",
                marginBottom: 10,
                letterSpacing: 0.5,
              }}
            >
              AUDIENCE
            </Text>
            {AUDIENCES.map((a) => {
              const Icon = a.icon;
              const isSelected = audienceType === a.key;
              return (
                <TouchableOpacity
                  key={a.key}
                  onPress={() => setAudienceType(a.key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: isSelected ? "#2C2C2E" : "#F8F8FC",
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? "#2C2C2E" : "#EEEFF3",
                  }}
                  activeOpacity={0.7}
                >
                  <Icon
                    size={18}
                    color={isSelected ? "#FFFFFF" : "#8E8E93"}
                    strokeWidth={2}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: isSelected ? "#FFFFFF" : "#1C1C1E",
                      }}
                    >
                      {a.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: isSelected ? "rgba(255,255,255,0.6)" : "#8E8E93",
                        marginTop: 1,
                      }}
                    >
                      {a.description}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: isSelected ? "#FFFFFF" : "#D1D1D6",
                      backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "#2C2C2E",
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Title Input */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#8E8E93",
                marginTop: 20,
                marginBottom: 8,
                letterSpacing: 0.5,
              }}
            >
              TITLE
            </Text>
            <View>
              <TextInput
                value={title}
                onChangeText={(t) => setTitle(t.slice(0, MAX_TITLE_LENGTH))}
                placeholder="Notification title"
                placeholderTextColor="#C7C7CC"
                style={{
                  backgroundColor: "#F8F8FC",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: Platform.OS === "ios" ? 12 : 8,
                  fontSize: 15,
                  color: "#1C1C1E",
                  fontWeight: "500",
                  borderWidth: 1,
                  borderColor: "#EEEFF3",
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: title.length >= MAX_TITLE_LENGTH ? "#C62828" : "#C7C7CC",
                  textAlign: "right",
                  marginTop: 4,
                }}
              >
                {title.length}/{MAX_TITLE_LENGTH}
              </Text>
            </View>

            {/* Body Input */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#8E8E93",
                marginTop: 12,
                marginBottom: 8,
                letterSpacing: 0.5,
              }}
            >
              MESSAGE
            </Text>
            <View>
              <TextInput
                value={body}
                onChangeText={(t) => setBody(t.slice(0, MAX_BODY_LENGTH))}
                placeholder="Write your notification message..."
                placeholderTextColor="#C7C7CC"
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: "#F8F8FC",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: "#1C1C1E",
                  fontWeight: "500",
                  minHeight: 100,
                  textAlignVertical: "top",
                  borderWidth: 1,
                  borderColor: "#EEEFF3",
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: body.length >= MAX_BODY_LENGTH ? "#C62828" : "#C7C7CC",
                  textAlign: "right",
                  marginTop: 4,
                }}
              >
                {body.length}/{MAX_BODY_LENGTH}
              </Text>
            </View>

            {/* Preview */}
            {(title.trim() || body.trim()) && (
              <View style={{ marginTop: 16 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#8E8E93",
                    marginBottom: 8,
                    letterSpacing: 0.5,
                  }}
                >
                  PREVIEW
                </Text>
                <View
                  style={{
                    backgroundColor: "#F8F8FC",
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "#EEEFF3",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                    <Bell size={14} color="#8E8E93" strokeWidth={2} />
                    <Text style={{ fontSize: 10, color: "#8E8E93", marginLeft: 6, fontWeight: "600" }}>
                      NG FreshFoods
                    </Text>
                    <Text style={{ fontSize: 10, color: "#C7C7CC", marginLeft: "auto" }}>now</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#1C1C1E" }}>
                    {title || "Title"}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#3C3C43", marginTop: 2, lineHeight: 18 }}>
                    {body || "Message body"}
                  </Text>
                </View>
              </View>
            )}

            {/* Send Button */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={sending || !title.trim() || !body.trim()}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 24,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor:
                  !title.trim() || !body.trim() ? "#D1D1D6" : "#2C2C2E",
                opacity: sending ? 0.7 : 1,
              }}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={16} color="#FFFFFF" strokeWidth={2.5} />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: "700",
                      marginLeft: 8,
                    }}
                  >
                    Send Broadcast
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AdminBroadcast;

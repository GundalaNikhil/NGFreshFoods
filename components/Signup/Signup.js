import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View, Image, StyleSheet } from "react-native";
import { Lock, Mail, Phone, Sprout, User } from "lucide-react-native";
import { useSetRecoilState } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import { signupWithBff } from "../../services/bff/authBff";

const Signup = ({ onSwitchToLogin }) => {
  const setAuth = useSetRecoilState(authAtom);
  const setProfile = useSetRecoilState(profileAtom);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.password.trim()
    ) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await signupWithBff(formData);

    if (response.success) {
      setAuth({
        isAuthenticated: true,
        token: response.data.token,
      });
      setProfile(response.data.profile);
    } else {
      setError(response.error.message);
    }

    setLoading(false);
  };

  return (
    <View className="w-full rounded-[34px] px-6 pt-12 pb-7 mt-14 relative" style={styles.card}>
      <View style={styles.softBlobOne} />
      <View style={styles.softBlobTwo} />

      <View className="absolute -top-20 left-0 right-0 items-center justify-center z-10 w-full">
        <View className="w-40 h-40 rounded-[46px] items-center justify-center overflow-hidden" style={styles.avatarFrame}>
          <Image source={require("../../assets/images/signup_character.png")} style={{ width: "86%", height: "86%" }} resizeMode="contain" />
        </View>
      </View>

      <View className="items-center mb-7 mt-6">
        <View className="flex-row items-center rounded-full px-4 py-2 mb-4" style={styles.badge}>
          <Sprout size={14} color="#1F7A4A" />
          <Text className="ml-2 text-[11px] font-extrabold tracking-[2px] uppercase text-emerald-800">Organic Family Circle</Text>
        </View>
        <Text className="text-[35px] font-extrabold text-stone-900 tracking-tight mb-1">Create Account</Text>
        <Text className="text-[13px] text-stone-600 font-semibold tracking-wide">Fresh ingredients. Zero compromises.</Text>
      </View>

      {error ? (
        <View className="rounded-2xl p-4 mb-5" style={styles.errorBox}>
          <Text className="text-red-700 text-center font-semibold text-[14px]">{error}</Text>
        </View>
      ) : null}

      <View className="flex-row justify-between mb-3">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center rounded-2xl px-4 py-1" style={styles.inputWrap}>
            <User size={16} color="#3f4b43" />
            <TextInput
              value={formData.firstName}
              onChangeText={(text) => onChange("firstName", text)}
              placeholder="First name"
              placeholderTextColor="#8f9a90"
              className="flex-1 ml-2 py-3 text-[15px] font-semibold text-stone-900"
            />
          </View>
        </View>
        <View className="flex-1 ml-2">
          <View className="flex-row items-center rounded-2xl px-4 py-1" style={styles.inputWrap}>
            <User size={16} color="#3f4b43" />
            <TextInput
              value={formData.lastName}
              onChangeText={(text) => onChange("lastName", text)}
              placeholder="Last name"
              placeholderTextColor="#8f9a90"
              className="flex-1 ml-2 py-3 text-[15px] font-semibold text-stone-900"
            />
          </View>
        </View>
      </View>

      <View className="mb-3">
        <View className="flex-row items-center rounded-2xl px-4 py-1" style={styles.inputWrap}>
          <Mail size={18} color="#3f4b43" />
          <TextInput
            value={formData.email}
            onChangeText={(text) => onChange("email", text)}
            placeholder="Email address"
            placeholderTextColor="#8f9a90"
            keyboardType="email-address"
            autoCapitalize="none"
            className="flex-1 ml-3 py-3 text-[15px] font-semibold text-stone-900"
          />
        </View>
      </View>

      <View className="mb-3">
        <View className="flex-row items-center rounded-2xl px-4 py-1" style={styles.inputWrap}>
          <Phone size={18} color="#3f4b43" />
          <TextInput
            value={formData.phoneNumber}
            onChangeText={(text) => onChange("phoneNumber", text)}
            placeholder="Phone number"
            placeholderTextColor="#8f9a90"
            keyboardType="phone-pad"
            className="flex-1 ml-3 py-3 text-[15px] font-semibold text-stone-900"
          />
        </View>
      </View>

      <View className="mb-6">
        <View className="flex-row items-center rounded-2xl px-4 py-1" style={styles.inputWrap}>
          <Lock size={18} color="#3f4b43" />
          <TextInput
            value={formData.password}
            onChangeText={(text) => onChange("password", text)}
            placeholder="Password"
            placeholderTextColor="#8f9a90"
            secureTextEntry
            className="flex-1 ml-3 py-3 text-[15px] font-semibold text-stone-900"
          />
        </View>
      </View>

      <TouchableOpacity
        className="rounded-2xl py-4 items-center"
        onPress={handleSignup}
        disabled={loading}
        activeOpacity={0.85}
        style={[styles.actionButton, loading ? styles.buttonDisabled : null]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-black text-[15px] uppercase tracking-[2px]">Get Started</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-7 flex-row justify-center items-center" onPress={onSwitchToLogin}>
        <Text className="text-[14px] text-stone-600 font-semibold">Already have an account? </Text>
        <Text className="text-[14px] text-emerald-700 font-black uppercase tracking-wider">Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 251, 244, 0.95)",
    borderWidth: 1,
    borderColor: "#F1E8D9",
    shadowColor: "#24341f",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  avatarFrame: {
    backgroundColor: "#FFF7EC",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#294d36",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 9 },
    elevation: 12,
  },
  badge: {
    backgroundColor: "rgba(207, 244, 219, 0.78)",
    borderWidth: 1,
    borderColor: "#B6E2C5",
  },
  errorBox: {
    backgroundColor: "#FFF4F3",
    borderWidth: 1,
    borderColor: "#F7CDC8",
  },
  inputWrap: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderWidth: 1,
    borderColor: "#D9E6D8",
  },
  actionButton: {
    backgroundColor: "#8A5A1F",
    borderWidth: 1,
    borderColor: "#E7C98A",
    shadowColor: "#5E3B10",
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 9 },
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: "#9C7A4B",
    borderColor: "#DDC799",
  },
  softBlobOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(179, 226, 196, 0.32)",
    top: -58,
    right: -48,
  },
  softBlobTwo: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 228, 186, 0.34)",
    bottom: -62,
    left: -52,
  },
});

export default Signup;

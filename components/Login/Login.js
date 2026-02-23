import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View, Image, StyleSheet } from "react-native";
import { Leaf, Lock, Mail } from "lucide-react-native";
import { useSetRecoilState } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import { loginWithBff } from "../../services/bff/authBff";
import { useFonts, PlayfairDisplay_800ExtraBold } from '@expo-google-fonts/playfair-display';

const Login = ({ onSwitchToSignup }) => {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_800ExtraBold,
  });

  const setAuth = useSetRecoilState(authAtom);
  const setProfile = useSetRecoilState(profileAtom);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await loginWithBff(formData);

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
    <View className="w-full rounded-[34px] px-6 pt-12 pb-7 mt-16 relative" style={styles.card}>
      <View style={styles.softBlobOne} />
      <View style={styles.softBlobTwo} />

      <View className="absolute -top-24 left-0 right-0 items-center justify-center z-10 w-full">
        <View className="w-40 h-40 rounded-[46px] items-center justify-center overflow-hidden" style={styles.avatarFrame}>
          <Image source={require("../../assets/images/login_character.png")} style={{ width: "86%", height: "86%" }} resizeMode="contain" />
        </View>
      </View>

      <View className="items-center mb-8 mt-6">
        <View className="flex-row items-center rounded-full px-4 py-2 mb-4" style={styles.badge}>
          <Leaf size={14} color="#1F7A4A" />
          <Text className="ml-2 text-[11px] font-extrabold tracking-[2px] uppercase text-emerald-800">Farm To Doorstep</Text>
        </View>
        {fontsLoaded ? (
          <Text className="text-[42px] text-stone-900 tracking-tight mb-1" style={{ fontFamily: 'PlayfairDisplay_800ExtraBold' }}>Welcome Back</Text>
        ) : (
          <Text className="text-[38px] font-extrabold text-stone-900 tracking-tight mb-1">Welcome Back</Text>
        )}
        <Text className="text-[13px] text-stone-600 font-semibold tracking-wide mt-1">Login to continue your fresh routine</Text>
      </View>

      {error ? (
        <View className="rounded-2xl p-4 mb-6" style={styles.errorBox}>
          <Text className="text-red-700 text-center font-semibold text-[14px]">{error}</Text>
        </View>
      ) : null}

      <View className="mb-2 w-full mt-4">
        <View className="flex-row items-center border-b-2 border-[#D9E6D8] pb-3 mb-6" style={styles.inputWrap}>
          <Mail size={18} color="#78857A" />
          <TextInput
            value={formData.email}
            onChangeText={(text) => onChange("email", text)}
            placeholder="Email Address"
            placeholderTextColor="#A9B3AB"
            keyboardType="email-address"
            autoCapitalize="none"
            className="flex-1 ml-3 px-1 text-[17px] font-medium text-stone-800"
          />
        </View>

        <View className="flex-row items-center border-b-2 border-[#D9E6D8] pb-3 mb-8" style={styles.inputWrap}>
          <Lock size={18} color="#78857A" />
          <TextInput
            value={formData.password}
            onChangeText={(text) => onChange("password", text)}
            placeholder="Secure Password"
            placeholderTextColor="#A9B3AB"
            secureTextEntry
            className="flex-1 ml-3 px-1 text-[17px] font-medium text-stone-800"
          />
        </View>
      </View>

      <TouchableOpacity
        className="rounded-full py-4 items-center overflow-hidden"
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
        style={[styles.actionButton, loading ? styles.buttonDisabled : null]}
      >
        <View className="absolute inset-0 bg-black/10" />
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-black text-[14px] uppercase tracking-[3.5px] z-10">Continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-7 flex-row justify-center items-center" onPress={onSwitchToSignup}>
        <Text className="text-[14px] text-stone-600 font-semibold">New to FreshFarms? </Text>
        <Text className="text-[14px] text-emerald-700 font-black uppercase tracking-wider">Sign up</Text>
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
    backgroundColor: "transparent",
  },
  actionButton: {
    backgroundColor: "#1F2B24", // Premium deep charcoal green
    borderWidth: 1,
    borderColor: "#3E5748",
    shadowColor: "#111814",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: "#637469",
    borderColor: "#889A8F",
  },
  softBlobOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(179, 226, 196, 0.32)",
    top: -54,
    right: -44,
  },
  softBlobTwo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 228, 186, 0.34)",
    bottom: -58,
    left: -54,
  },
});

export default Login;

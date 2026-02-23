import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useSetRecoilState } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import { loginWithBff } from "../../services/bff/authBff";

const Login = ({ onSwitchToSignup }) => {
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
    <View className="w-full bg-white rounded-3xl p-6 pt-12 shadow-2xl border-4 border-white mt-20 relative">
      {/* 3D Character Pop-out Sticker Header */}
      <View className="absolute -top-24 left-0 right-0 items-center justify-center z-10 w-full">
        <View className="w-40 h-40 rounded-full items-center justify-center bg-white border-[6px] border-white overflow-hidden shadow-2xl" style={{ elevation: 15 }}>
          <Image 
            source={require("../../assets/images/login_character.png")}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>

      <View className="items-center mb-10 mt-6">
        <Text className="text-4xl font-extrabold text-gray-900 tracking-tighter mb-2">Welcome Back</Text>
        <Text className="text-[13px] text-emerald-700 font-bold uppercase tracking-widest opacity-90">
          Fresh Grocery Delivery
        </Text>
      </View>

      {error ? (
        <View className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
          <Text className="text-red-700 text-center font-bold text-[14px]">{error}</Text>
        </View>
      ) : null}

      <View className="mb-5">
        <Text className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Email Address</Text>
        <TextInput
          value={formData.email}
          onChangeText={(text) => onChange("email", text)}
          placeholder="your@email.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-[16px] font-semibold text-gray-900 focus:border-emerald-500 focus:bg-white"
        />
      </View>

      <View className="mb-8">
        <Text className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Password</Text>
        <TextInput
          value={formData.password}
          onChangeText={(text) => onChange("password", text)}
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          className="bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-[16px] font-semibold text-gray-900 focus:border-emerald-500 focus:bg-white"
        />
      </View>

      <TouchableOpacity
        className={`rounded-2xl py-4 items-center shadow-xl ${loading ? "bg-emerald-400" : "bg-emerald-600"}`}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
        style={{ elevation: 5 }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-black text-[16px] uppercase tracking-widest">Log In Securely</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-8 flex-row justify-center items-center" onPress={onSwitchToSignup}>
        <Text className="text-[14px] text-gray-500 font-bold">New to FreshFarms? </Text>
        <Text className="text-[14px] text-emerald-600 font-black uppercase tracking-wider">Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

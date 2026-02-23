import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
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
    <View className="w-full bg-white rounded-3xl p-6 pt-12 shadow-2xl border-4 border-white mt-16 relative">
      {/* 3D Character Pop-out Sticker Header */}
      <View className="absolute -top-20 left-0 right-0 items-center justify-center z-10 w-full">
        <View className="w-40 h-40 rounded-full items-center justify-center bg-white border-[6px] border-white overflow-hidden shadow-2xl" style={{ elevation: 15 }}>
          <Image 
            source={require("../../assets/images/signup_character.png")}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>

      <View className="items-center mb-8 mt-6">
        <Text className="text-4xl font-extrabold text-gray-900 tracking-tighter mb-2">Join FreshFarms</Text>
        <Text className="text-[13px] text-emerald-700 font-bold uppercase tracking-widest opacity-90">
          Get fresh farm delivery
        </Text>
      </View>

      {error ? (
        <View className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
          <Text className="text-red-700 text-center font-bold text-[14px]">{error}</Text>
        </View>
      ) : null}

      <View className="flex-row justify-between mb-4">
        <View className="flex-1 mr-2">
          <Text className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">First Name</Text>
          <TextInput
            value={formData.firstName}
            onChangeText={(text) => onChange("firstName", text)}
            placeholder="John"
            placeholderTextColor="#9ca3af"
            className="bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-semibold text-gray-900 focus:border-emerald-500 focus:bg-white"
          />
        </View>
        <View className="flex-1 ml-2">
          <Text className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Last Name</Text>
          <TextInput
            value={formData.lastName}
            onChangeText={(text) => onChange("lastName", text)}
            placeholder="Doe"
            placeholderTextColor="#9ca3af"
            className="bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-semibold text-gray-900 focus:border-emerald-500 focus:bg-white"
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Email Address</Text>
        <TextInput
          value={formData.email}
          onChangeText={(text) => onChange("email", text)}
          placeholder="your@email.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-semibold text-gray-900 focus:border-emerald-500 focus:bg-white"
        />
      </View>

      <View className="mb-4">
        <Text className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Phone</Text>
        <TextInput
          value={formData.phoneNumber}
          onChangeText={(text) => onChange("phoneNumber", text)}
          placeholder="+91 98765 43210"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          className="bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-semibold text-gray-900 focus:border-emerald-500 focus:bg-white"
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
          className="bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-semibold text-gray-900 focus:border-emerald-500 focus:bg-white"
        />
      </View>

      <TouchableOpacity
        className={`rounded-2xl py-4 items-center shadow-xl ${loading ? "bg-emerald-400" : "bg-emerald-600"}`}
        onPress={handleSignup}
        disabled={loading}
        activeOpacity={0.8}
        style={{ elevation: 5 }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-black text-[16px] uppercase tracking-widest">Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-8 flex-row justify-center items-center" onPress={onSwitchToLogin}>
        <Text className="text-[14px] text-gray-500 font-bold">Already have an account? </Text>
        <Text className="text-[14px] text-emerald-600 font-black uppercase tracking-wider">Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Signup;

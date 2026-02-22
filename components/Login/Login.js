import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
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
    <View className="w-full bg-white rounded-2xl p-5 shadow-sm">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Login</Text>

      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <Text className="text-red-700">{error}</Text>
        </View>
      ) : null}

      <TextInput
        value={formData.email}
        onChangeText={(text) => onChange("email", text)}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
      />

      <TextInput
        value={formData.password}
        onChangeText={(text) => onChange("password", text)}
        placeholder="Password"
        secureTextEntry
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
      />

      <TouchableOpacity
        className={`rounded-lg py-3 items-center ${loading ? "bg-gray-400" : "bg-emerald-600"}`}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-4" onPress={onSwitchToSignup}>
        <Text className="text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Text className="text-emerald-700 font-semibold">Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
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
    <View className="w-full bg-white rounded-2xl p-5 shadow-sm">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Sign up</Text>

      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <Text className="text-red-700">{error}</Text>
        </View>
      ) : null}

      <TextInput
        value={formData.firstName}
        onChangeText={(text) => onChange("firstName", text)}
        placeholder="First Name"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
      />

      <TextInput
        value={formData.lastName}
        onChangeText={(text) => onChange("lastName", text)}
        placeholder="Last Name"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
      />

      <TextInput
        value={formData.email}
        onChangeText={(text) => onChange("email", text)}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
      />

      <TextInput
        value={formData.phoneNumber}
        onChangeText={(text) => onChange("phoneNumber", text)}
        placeholder="Phone Number"
        keyboardType="phone-pad"
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
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-4" onPress={onSwitchToLogin}>
        <Text className="text-center text-gray-600">
          Already have an account?{" "}
          <Text className="text-emerald-700 font-semibold">Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Signup;

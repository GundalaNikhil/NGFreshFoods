import { LogIn } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const LoginButton = () => {
  const handleLogin = () => {
    console.log("Login button clicked");
    // Handle login logic here
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <TouchableOpacity
        onPress={handleLogin}
        className="flex-row items-center justify-center bg-blue-500 px-8 py-4 rounded-lg"
      >
        <LogIn size={20} color="white" style={{ marginRight: 8 }} />
        <Text className="text-white font-bold text-lg">Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginButton;

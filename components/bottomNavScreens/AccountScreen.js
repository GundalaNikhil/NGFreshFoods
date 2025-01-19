import React from "react";
import { Text, View } from "react-native";
import Account from "../../components/Account/Account";

const AccountScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-semibold text-gray-800">
        Account Screen
      </Text>
      <Account />
    </View>
  );
};

export default AccountScreen;

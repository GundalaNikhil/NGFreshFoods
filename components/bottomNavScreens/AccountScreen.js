import React from "react";
import { ScrollView } from "react-native";
import Account from "../../components/Account/Account";

const AccountScreen = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <Account />
    </ScrollView>
  );
};

export default AccountScreen;

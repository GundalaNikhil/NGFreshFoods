import React from "react";
import { View } from "react-native";
import { useRecoilValue } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import AuthScreen from "../Login/AuthScreen";
import AccountHub from "./AccountHub";

const Account = () => {
  const auth = useRecoilValue(authAtom);

  if (auth.isAuthenticated) {
    return (
      <View className="flex-1 w-full bg-gray-50 p-4">
        <AccountHub />
      </View>
    );
  }

  return <AuthScreen />;
};

export default Account;

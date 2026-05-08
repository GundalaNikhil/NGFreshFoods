import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import AuthScreen from "../Login/AuthScreen";
import AccountHub from "./AccountHub";

const Account = () => {
  const auth = useRecoilValue(authAtom);

  if (auth.isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top']}>
        <View className="flex-1 w-full bg-gray-50 p-2">
          <AccountHub />
        </View>
      </SafeAreaView>
    );
  }

  return <AuthScreen />;
};

export default Account;

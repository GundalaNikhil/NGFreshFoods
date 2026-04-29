import React from "react";
import { View } from "react-native";
import { useRecoilValue } from "recoil";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import AdminPanel from "../Admin/AdminPanel";
import Account from "../Account/Account";

/**
 * Smart screen wrapper: renders full AdminPanel for admins,
 * regular Account for customers.
 */
const AccountScreen = () => {
  const profile = useRecoilValue(profileAtom);
  const isAdmin = profile.role === "ADMIN";

  if (isAdmin) {
    return (
      <View className="flex-1 bg-[#F5F5FA]">
        <AdminPanel />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Account />
    </View>
  );
};

export default AccountScreen;

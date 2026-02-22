import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import { profileAtom } from "../../recoil/atoms/profileAtom";

const Profile = () => {
  const profile = useRecoilValue(profileAtom);
  const resetAuth = useResetRecoilState(authAtom);
  const resetProfile = useResetRecoilState(profileAtom);

  const handleLogout = () => {
    resetAuth();
    resetProfile();
  };

  return (
    <View className="w-full bg-white rounded-2xl p-5 shadow-sm">
      <Text className="text-xl font-bold text-gray-900 mb-1">
        {profile.fullName || "User"}
      </Text>
      <Text className="text-gray-600 mb-1">{profile.email || "-"}</Text>
      <Text className="text-gray-600 mb-4">{profile.phoneNumber || "-"}</Text>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-600 rounded-lg py-3 items-center"
      >
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;

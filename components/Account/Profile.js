import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import authFirebase from '@react-native-firebase/auth';

const Profile = () => {
  const profile = useRecoilValue(profileAtom);
  const setAuth = useSetRecoilState(authAtom);
  const resetProfile = useResetRecoilState(profileAtom);

  const handleLogout = async () => {
    try {
      await authFirebase().signOut();
    } catch (error) {
      console.error("Firebase logout error:", error);
    }
    
    // Clear local state routing even if Firebase fails
    setAuth((prev) => ({
      ...prev,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
    }));
    resetProfile();
  };

  return (
    <View className="w-full bg-white rounded-2xl p-5" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
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

import React from "react";
import { View, ImageBackground, StyleSheet } from "react-native";
import { useRecoilValue } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import Login from "../Login/Login";
import Signup from "../Signup/Signup";
import Profile from "./Profile";

const Account = () => {
  const auth = useRecoilValue(authAtom);
  const [authMode, setAuthMode] = React.useState("login");

  if (auth.isAuthenticated) {
    return (
      <View className="flex-1 w-full bg-gray-50 p-4">
        <Profile />
      </View>
    );
  }

  return (
    <View className="flex-1 w-full flex">
      <ImageBackground 
        source={
          authMode === "login" 
            ? require("../../assets/images/login_bg_meat_mobile.png") 
            : require("../../assets/images/signup_bg_meat_mobile.png")
        }
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        <View className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-emerald-200/40" />
        <View className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-amber-100/50" />
        <View className="flex-1 bg-black/25 justify-center px-5">
          {authMode === "login" ? (
            <Login onSwitchToSignup={() => setAuthMode("signup")} />
          ) : (
            <Signup onSwitchToLogin={() => setAuthMode("login")} />
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

export default Account;

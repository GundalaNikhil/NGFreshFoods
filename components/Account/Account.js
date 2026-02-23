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
        source={require("../../assets/images/organic_auth_bg.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        {/* Dark subtle overlay for legibility */}
        <View className="flex-1 bg-black/40 justify-center px-5">
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

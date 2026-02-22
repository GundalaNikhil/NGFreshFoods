import React from "react";
import { View } from "react-native";
import { useRecoilValue } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import Login from "../Login/Login";
import Signup from "../Signup/Signup";
import Profile from "./Profile";

const Account = () => {
  const auth = useRecoilValue(authAtom);
  const [authMode, setAuthMode] = React.useState("login");

  return (
    <View className="w-full">
      {auth.isAuthenticated ? (
        <Profile />
      ) : authMode === "login" ? (
        <Login onSwitchToSignup={() => setAuthMode("signup")} />
      ) : (
        <Signup onSwitchToLogin={() => setAuthMode("login")} />
      )}
    </View>
  );
};

export default Account;

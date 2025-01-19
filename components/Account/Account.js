import React from "react";
import { View } from "react-native";
import { useRecoilValue } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import LoginButton from "../Login/LoginButton";
import Profile from "./Profile";

const Account = () => {
  const auth = useRecoilValue(authAtom);

  return <View>{auth.isAuthenticated ? <Profile /> : <LoginButton />}</View>;
};

export default Account;

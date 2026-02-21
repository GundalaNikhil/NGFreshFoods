import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

export const authAtom = atom({
  key: "authState",
  default: {
    isLoggedIn: false,
    user: null,
  },
  ...persistAtom("auth"),
});

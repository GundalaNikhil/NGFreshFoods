import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

export const authAtom = atom({
  key: "authState",
  default: {
    isAuthenticated: false,
    token: null,
    refreshToken: null,
    isHydrated: false,
  },
  ...persistAtom("auth"),
});

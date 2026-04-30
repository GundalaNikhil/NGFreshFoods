import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

export const authAtom = atom({
  key: "authState",
  default: {
    isAuthenticated: false,
    isHydrated: false,
  },
  ...persistAtom("auth"),
});

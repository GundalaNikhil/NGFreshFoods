import { atom } from "recoil";

export const authAtom = atom({
  key: "authAtom",
  default: {
    isAuthenticated: false,
    user: null,
    token: null,
  },
});

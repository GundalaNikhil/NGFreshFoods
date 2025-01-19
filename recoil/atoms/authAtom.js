import { atom } from "recoil";

export const authAtom = atom({
  key: "authState",
  default: {
    isLoggedIn: false,
    user: null,
  },
});

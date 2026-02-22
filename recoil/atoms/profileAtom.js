import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

export const profileAtom = atom({
  key: "profileAtom",
  default: {
    userId: "",
    email: "",
    firstName: "",
    lastName: "",
    fullName: "",
    phoneNumber: "",
    addresses: [],
    addressId: null,
  },
  ...persistAtom("profile"),
});


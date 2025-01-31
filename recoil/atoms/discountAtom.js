import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

export const promoCodeState = atom({
  key: "promoCodeState",
  default: {
    code: null,
    discount: 0,
  },
  ...persistAtom("promoCode"),
});

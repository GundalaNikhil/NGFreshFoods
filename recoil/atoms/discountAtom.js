import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

export const promoCodeState = atom({
  key: "promoCodeState",
  default: {
    promoCode: null,
    promoDiscount: 0,
    offer: null,
    offerDiscount: 0,
  },
  ...persistAtom("promoCode"),
});

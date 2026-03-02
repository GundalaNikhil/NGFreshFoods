import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

export const cartState = atom({
  key: "cartState",
  default: {
    items: [],
    _version: 0,
    appliedOffer: false,
    promoCode: null,
    offer: null,
    discountAmount: 0,
  },
  ...persistAtom("cart"),
});
 
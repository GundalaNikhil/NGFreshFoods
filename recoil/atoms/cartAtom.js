import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

export const cartState = atom({
  key: "cartState",
  default: {
    items: [],
    appliedOffer: false,
    promoCode: null,
    offer: null,
    discountAmount: 0,
  },
  ...persistAtom("cart"),
});
 
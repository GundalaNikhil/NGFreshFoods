import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

export const cartState = atom({
  key: "cartState",
  default: [],
  ...persistAtom("cart"),
});

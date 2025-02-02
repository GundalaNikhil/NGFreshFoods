import { selector } from "recoil";
import { cartState } from "../atoms/cartAtom";
import { promoCodeState } from "../atoms/discountAtom";

export const cartTotalSelector = selector({
  key: "cartTotal",
  get: ({ get }) => {
    const cart = get(cartState);
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
});

export const cartDiscountSelector = selector({
  key: "cartDiscount",
  get: ({ get }) => {
    const cart = get(cartState);
    const promoCode = get(promoCodeState);

    const itemsDiscount = cart.reduce(
      (total, item) => total + (item.mrp - item.price) * item.quantity,
      0
    );

    return itemsDiscount + promoCode.discount;
  },
});

export const cartItemsCountSelector = selector({
  key: "cartItemsCount",
  get: ({ get }) => {
    const cart = get(cartState);
    return cart.reduce((total, item) => total + item.quantity, 0);
  },
});

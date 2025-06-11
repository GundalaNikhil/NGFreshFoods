import { selector } from "recoil";
import { cartState } from "../atoms/cartAtom";
import { promoCodeState } from "../atoms/discountAtom";

export const cartTotalSelector = selector({
  key: "cartTotalSelector",
  get: ({ get }) => {
    const cart = get(cartState);
    const items = cart.items || [];
    return items.reduce((total, item) => {
      let itemTotal;

      if (item.custPrice !== undefined) {
        itemTotal = item.custPrice;
      } else if (item.totalPrice !== undefined) {
        itemTotal = item.totalPrice;
      } else {
        const basePrice = item.itemPrice || item.price;
        const quantity = item.custQuantity || item.quantity;
        itemTotal = basePrice * quantity;
      }

      return total + itemTotal;
    }, 0);
  },
});

export const cartItemsCountSelector = selector({
  key: "cartItemsCountSelector",
  get: ({ get }) => {
    const cart = get(cartState);
    const items = cart.items || [];
    return items.reduce((count, item) => {
      const quantity = item.custQuantity || item.quantity;
      return count + quantity;
    }, 0);
  },
});

export const cartDiscountSelector = selector({
  key: "cartDiscountSelector",
  get: ({ get }) => {
    const cart = get(cartState);
    const promoCode = get(promoCodeState);
    const cartTotal = get(cartTotalSelector);

    if (!promoCode.offerDetails) return 0;

    const offer = promoCode.offerDetails;

    switch (offer.discountType) {
      case "WELCOM50":
        return Math.min(offer.discountValue, cartTotal);
      case "FRESH20":
        const percentDiscount = (cartTotal * offer.discountValue) / 100;
        return offer.maxDiscount
          ? Math.min(percentDiscount, offer.maxDiscount)
          : percentDiscount;
      default:
        return promoCode.discount;
    }
  },
});

export const finalTotalSelector = selector({
  key: "finalTotalSelector",
  get: ({ get }) => {
    const cartTotal = get(cartTotalSelector);
    const discount = get(cartDiscountSelector);
    return Math.max(0, cartTotal - discount);
  },
});

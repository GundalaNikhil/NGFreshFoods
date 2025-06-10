import { selector } from "recoil";
import { cartState } from "../atoms/cartAtom";
import { promoCodeState } from "../atoms/discountAtom";

export const cartTotalSelector = selector({
  key: "cartTotalSelector",
  get: ({ get }) => {
    const cart = get(cartState);
    return cart.reduce((total, item) => {
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
    return cart.reduce((count, item) => {
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
    const subtotal = get(cartTotalSelector);

    // Calculate base discount (MRP - Price savings)
    const baseDiscount = cart.reduce((discount, item) => {
      const itemMrp = item.mrp || item.price;
      const itemPrice = item.itemPrice || item.price;
      return discount + (itemMrp - itemPrice) * item.quantity;
    }, 0);

    // Add promo code discount
    const promoDiscount = promoCode.discount || 0;

    return baseDiscount + promoDiscount;
  },
});

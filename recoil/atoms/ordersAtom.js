import { atom } from "recoil";

/**
 * Orders state atom.
 * Tracks the last placed order (for success screen) and order history.
 */
export const ordersAtom = atom({
  key: "ordersAtom",
  default: {
    /** The most recently placed order (shown on success screen) */
    lastOrder: null,
    /** Full list from /my endpoint */
    orderHistory: [],
  },
});

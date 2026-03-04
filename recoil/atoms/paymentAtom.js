import { atom } from "recoil";

/**
 * Payment flow state atom.
 * Tracks the checkout lifecycle from idle through payment to success/failure.
 */
export const paymentAtom = atom({
  key: "paymentAtom",
  default: {
    /** IDLE | CREATING_ORDER | AWAITING_PAYMENT | VERIFYING | SUCCESS | FAILED | CANCELLED */
    checkoutState: "IDLE",
    /** The order response from the backend */
    currentOrder: null,
    /** Razorpay config for opening checkout */
    razorpayConfig: null,
    /** Error message if checkout failed */
    error: null,
    /** Selected payment method: ONLINE | COD */
    paymentMethod: "ONLINE",
  },
});

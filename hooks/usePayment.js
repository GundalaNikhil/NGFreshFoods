import { useCallback, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Alert } from "react-native";

const getRazorpayModule = () => {
  try {
    const mod = require("react-native-razorpay");
    return mod?.default || mod;
  } catch (e) {
    console.warn("[usePayment] react-native-razorpay not available:", e.message);
    return null;
  }
};
import { paymentAtom } from "../recoil/atoms/paymentAtom";
import { authAtom } from "../recoil/atoms/authAtom";
import { profileAtom } from "../recoil/atoms/profileAtom";
import { useCart } from "./useCart";
import { createOrder, verifyPayment, getPaymentStatus } from "../services/bff/paymentBff";

// ── Timeout wrapper ──
const withTimeout = (promise, ms, label = "Request") => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms / 1000}s. Please check your internet and try again.`)),
        ms
      )
    ),
  ]);
};

/**
 * usePayment – orchestrates the full checkout flow:
 * 1. Build order payload from cart
 * 2. Create order on backend (receives Razorpay order config)
 * 3. Open Razorpay native checkout
 * 4. On success → verify payment on backend
 * 5. Navigate to success screen, then clear cart
 *
 * Edge cases handled:
 * - User cancels Razorpay → CANCELLED state (not FAILED)
 * - Network timeout on create/verify → user-friendly timeout message
 * - Verification fails after payment → fallback status poll
 * - Double-click → isProcessing ref lock
 * - Missing auth/cart → early validation with clear messages
 */
export const usePayment = () => {
  const [payment, setPayment] = useRecoilState(paymentAtom);
  const authState = useRecoilValue(authAtom);
  const profile = useRecoilValue(profileAtom);
  const { cart, cartData, cartTotal, cartDiscount, clearCart } = useCart();
  const isProcessing = useRef(false);
  const lastCreatedOrder = useRef(null); // Track last order to avoid duplicates on retry

  const resetPayment = useCallback(() => {
    setPayment({
      checkoutState: "IDLE",
      currentOrder: null,
      razorpayConfig: null,
      error: null,
      paymentMethod: "ONLINE",
    });
    lastCreatedOrder.current = null;
  }, [setPayment]);

  const setPaymentMethod = useCallback(
    (method) => {
      setPayment((prev) => ({ ...prev, paymentMethod: method }));
    },
    [setPayment]
  );

  /**
   * Build the order payload from current cart state.
   */
  const buildOrderPayload = useCallback(() => {
    const items = cart.map((item) => ({
      productId: item.productId || null,
      variantId: item.variantId || null,
      addonIds: item.addonIds || [],
      quantity: item.quantity || 1,
      price: item.unitPrice || 0,
      totalPrice: item.lineTotal || 0,
      name: item.name || "Item",
      imageUrl: item.imageUrl || null,
    }));

    const promoCode = cartData?.promoCode || null;
    const discountAmount = cartData?.discountAmount || 0;
    const userId = profile?.userId || null;

    return {
      user: { userId },
      orderItems: items,
      totalAmount: cartTotal,
      discountAmount: discountAmount,
      discountCode: promoCode,
      shippingAddress: { addressId: profile?.addressId || null },
    };
  }, [cart, cartData, cartTotal, authState, profile]);

  /**
   * Detect if a Razorpay error is a user-initiated cancellation.
   */
  const isUserCancellation = (error) => {
    const code = error?.code;
    const desc = (error?.description || error?.message || "").toLowerCase();
    return (
      code === "PAYMENT_CANCELLED" ||
      code === 2 || // Razorpay Android cancel code
      desc.includes("cancelled") ||
      desc.includes("canceled") ||
      desc.includes("user closed") ||
      desc.includes("dismissed")
    );
  };

  /**
   * Fallback verification: poll backend for payment status
   * when verify endpoint fails but payment may have succeeded.
   */
  const fallbackVerify = useCallback(
    async (orderId, maxAttempts = 3) => {
      console.log("[usePayment] Starting fallback verification for order:", orderId);
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise((r) => setTimeout(r, 2000 * attempt)); // backoff: 2s, 4s, 6s
        try {
          const statusResult = await withTimeout(
            getPaymentStatus(orderId),
            10000,
            "Payment status check"
          );
          if (statusResult.success) {
            const status = statusResult.data?.paymentStatus;
            console.log(`[usePayment] Fallback attempt ${attempt}: status=${status}`);
            if (status === "COMPLETED" || status === "CAPTURED" || status === "SUCCESS") {
              return { success: true, data: statusResult.data };
            }
            if (status === "FAILED" || status === "REFUNDED") {
              return { success: false, data: statusResult.data };
            }
            // PENDING — keep polling
          }
        } catch (e) {
          console.warn(`[usePayment] Fallback attempt ${attempt} failed:`, e.message);
        }
      }
      return { success: false, data: null };
    },
    []
  );

  /**
   * Main checkout function – call this from the Place Order button.
   */
  const startCheckout = useCallback(async () => {
    if (isProcessing.current) {
      console.log("[usePayment] Checkout already in progress, skipping");
      return { success: false, error: "Checkout already in progress" };
    }
    isProcessing.current = true;
    let checkoutSucceeded = false;

    try {
      // ── Pre-validation ──
      if (!authState?.isAuthenticated || !authState?.token) {
        throw new Error("Please log in to place an order");
      }

      const orderPayload = buildOrderPayload();

      if (!orderPayload.user?.userId) {
        throw new Error("Please complete your profile to place an order");
      }

      if (!orderPayload.orderItems?.length) {
        throw new Error("Your cart is empty");
      }

      // ── Step 1: Create order on backend ──
      setPayment((prev) => ({
        ...prev,
        checkoutState: "CREATING_ORDER",
        error: null,
      }));

      console.log("[usePayment] → Creating order on backend...");
      const orderResult = await withTimeout(
        createOrder(orderPayload),
        30000, // 30s timeout for order creation
        "Order creation"
      );

      if (!orderResult.success) {
        const errMsg = orderResult.error?.message || "Failed to create order";
        // Detect common server errors
        if (orderResult.error?.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        if (orderResult.error?.status === 409) {
          throw new Error("A conflicting order already exists. Please try again in a moment.");
        }
        if (orderResult.error?.status >= 500) {
          throw new Error("Our servers are busy. Please try again in a moment.");
        }
        throw new Error(errMsg);
      }

      const order = orderResult.data;
      const razorpayOrderId = order.razorPayOrderId;
      const razorpayKeyId = order.razorpayKeyId || order.payment?.razorpayKeyId;
      const amount = order.totalAmount;

      // Save for retry (avoids creating duplicate orders)
      lastCreatedOrder.current = order;

      if (!razorpayOrderId || !razorpayKeyId) {
        throw new Error("Payment configuration missing. Please try again.");
      }

      setPayment((prev) => ({
        ...prev,
        checkoutState: "AWAITING_PAYMENT",
        currentOrder: order,
        razorpayConfig: { razorpayOrderId, razorpayKeyId, amount },
      }));

      // ── Step 2: Open Razorpay Checkout ──
      const rzpOptions = {
        description: "FreshFoods Order",
        image: "https://i.imgur.com/3g7nmJC.png",
        currency: "INR",
        key: razorpayKeyId,
        amount: Math.round(amount * 100),
        name: "FreshFoods",
        order_id: razorpayOrderId,
        prefill: {
          email: profile?.email || "",
          contact: profile?.phoneNumber || "",
          name: profile?.fullName || profile?.firstName || "",
        },
        theme: { color: "#16A34A" },
        retry: { enabled: true, max_count: 3 }, // Allow 3 Razorpay-level retries
      };

      const RazorpayCheckout = getRazorpayModule();
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== "function") {
        throw new Error(
          "Payment module not loaded. Please rebuild the app:\n" +
          "npx expo prebuild --clean && npx expo run:android"
        );
      }

      console.log("[usePayment] → Opening Razorpay Checkout...");
      const rzpResponse = await RazorpayCheckout.open(rzpOptions);
      console.log("[usePayment] ← Razorpay success:", {
        hasPaymentId: !!rzpResponse?.razorpay_payment_id,
        hasSignature: !!rzpResponse?.razorpay_signature,
      });

      // ── Step 3: Verify payment on backend ──
      setPayment((prev) => ({ ...prev, checkoutState: "VERIFYING" }));

      let verifyResult;
      try {
        verifyResult = await withTimeout(
          verifyPayment({
            orderId: order.orderId,
            razorpayOrderId: rzpResponse.razorpay_order_id,
            razorpayPaymentId: rzpResponse.razorpay_payment_id,
            razorpaySignature: rzpResponse.razorpay_signature,
          }),
          20000, // 20s timeout for verification
          "Payment verification"
        );
      } catch (verifyError) {
        // Verification network error — payment may have succeeded!
        // Use fallback polling
        console.warn("[usePayment] Verify call failed, trying fallback:", verifyError.message);
        setPayment((prev) => ({
          ...prev,
          checkoutState: "VERIFYING",
          error: null, // Don't show error yet, we're still trying
        }));
        const fallbackResult = await fallbackVerify(order.orderId);
        if (fallbackResult.success) {
          verifyResult = fallbackResult;
        } else {
          throw new Error(
            "Payment may have been charged but verification failed. " +
            "Please check your order history or contact support. " +
            "Do NOT retry payment."
          );
        }
      }

      if (!verifyResult.success) {
        throw new Error(
          verifyResult.error?.message || "Payment verification failed. Please check your bank statement."
        );
      }

      // ── Step 4: Success! ──
      console.log("[usePayment] ✓ Payment successful!");
      setPayment((prev) => ({
        ...prev,
        checkoutState: "SUCCESS",
        currentOrder: { ...order, payment: verifyResult.data },
      }));

      lastCreatedOrder.current = null; // Clear on success
      checkoutSucceeded = true;
      return { success: true, order: { ...order, payment: verifyResult.data } };
    } catch (error) {
      const errorMessage =
        error?.description || error?.message || "Payment failed";

      console.error("[usePayment] ✗ Checkout failed:", {
        message: errorMessage,
        code: error?.code,
      });

      // ── Distinguish user cancellation from real failures ──
      if (isUserCancellation(error)) {
        console.log("[usePayment] User cancelled payment");
        setPayment((prev) => ({
          ...prev,
          checkoutState: "CANCELLED",
          error: null, // No error message for intentional cancellation
        }));
        return { success: false, cancelled: true };
      }

      // ── Real failure ──
      setPayment((prev) => ({
        ...prev,
        checkoutState: "FAILED",
        error: errorMessage,
      }));

      // Only show alert for non-network-timeout errors
      // (timeout errors are already user-friendly in the message)
      if (!errorMessage.includes("timed out")) {
        Alert.alert(
          "Payment Failed",
          errorMessage,
          [{ text: "OK" }]
        );
      }

      return { success: false, error: errorMessage };
    } finally {
      // Only release the processing lock on failure/cancel.
      // On success, the lock stays until Cart.js calls resetProcessingFlag().
      if (!checkoutSucceeded) {
        isProcessing.current = false;
      }
    }
  }, [buildOrderPayload, setPayment, clearCart, authState, profile, fallbackVerify]);

  /**
   * Retry checkout — reuses the existing order if same items.
   * If the order was already created, just re-opens Razorpay.
   */
  const retryCheckout = useCallback(async () => {
    // If we have a previous order that hasn't been paid, skip creation
    if (lastCreatedOrder.current?.razorPayOrderId) {
      const order = lastCreatedOrder.current;
      console.log("[usePayment] Retrying with existing order:", order.orderId);

      isProcessing.current = true;
      let checkoutSucceeded = false;

      try {
        setPayment((prev) => ({
          ...prev,
          checkoutState: "AWAITING_PAYMENT",
          currentOrder: order,
          error: null,
        }));

        const rzpOptions = {
          description: "FreshFoods Order",
          image: "https://i.imgur.com/3g7nmJC.png",
          currency: "INR",
          key: order.razorpayKeyId || order.payment?.razorpayKeyId,
          amount: Math.round(order.totalAmount * 100),
          name: "FreshFoods",
          order_id: order.razorPayOrderId,
          prefill: {
            email: profile?.email || "",
            contact: profile?.phoneNumber || "",
            name: profile?.fullName || profile?.firstName || "",
          },
          theme: { color: "#16A34A" },
          retry: { enabled: true, max_count: 3 },
        };

        const RazorpayCheckout = getRazorpayModule();
        if (!RazorpayCheckout || typeof RazorpayCheckout.open !== "function") {
          throw new Error("Payment module not available");
        }

        const rzpResponse = await RazorpayCheckout.open(rzpOptions);

        setPayment((prev) => ({ ...prev, checkoutState: "VERIFYING" }));

        let verifyResult;
        try {
          verifyResult = await withTimeout(
            verifyPayment({
              orderId: order.orderId,
              razorpayOrderId: rzpResponse.razorpay_order_id,
              razorpayPaymentId: rzpResponse.razorpay_payment_id,
              razorpaySignature: rzpResponse.razorpay_signature,
            }),
            20000,
            "Payment verification"
          );
        } catch (verifyError) {
          const fallbackResult = await fallbackVerify(order.orderId);
          if (fallbackResult.success) {
            verifyResult = fallbackResult;
          } else {
            throw new Error(
              "Verification failed. Please check your order history."
            );
          }
        }

        if (!verifyResult.success) {
          throw new Error(verifyResult.error?.message || "Verification failed");
        }

        setPayment((prev) => ({
          ...prev,
          checkoutState: "SUCCESS",
          currentOrder: { ...order, payment: verifyResult.data },
        }));

        lastCreatedOrder.current = null;
        checkoutSucceeded = true;
        return { success: true, order: { ...order, payment: verifyResult.data } };
      } catch (error) {
        if (isUserCancellation(error)) {
          setPayment((prev) => ({ ...prev, checkoutState: "CANCELLED", error: null }));
          return { success: false, cancelled: true };
        }
        const msg = error?.description || error?.message || "Retry failed";
        setPayment((prev) => ({ ...prev, checkoutState: "FAILED", error: msg }));
        return { success: false, error: msg };
      } finally {
        if (!checkoutSucceeded) {
          isProcessing.current = false;
        }
      }
    }

    // No existing order — full fresh checkout
    return startCheckout();
  }, [startCheckout, setPayment, profile, fallbackVerify]);

  /**
   * Force-reset the processing flag.
   * Called by Cart.js after navigating to the success screen.
   */
  const resetProcessingFlag = useCallback(() => {
    isProcessing.current = false;
  }, []);

  return {
    payment,
    checkoutState: payment.checkoutState,
    currentOrder: payment.currentOrder,
    paymentMethod: payment.paymentMethod,
    error: payment.error,
    isLoading:
      payment.checkoutState === "CREATING_ORDER" ||
      payment.checkoutState === "VERIFYING",
    isAwaitingPayment: payment.checkoutState === "AWAITING_PAYMENT",
    isSuccess: payment.checkoutState === "SUCCESS",
    isFailed: payment.checkoutState === "FAILED",
    isCancelled: payment.checkoutState === "CANCELLED",
    startCheckout,
    retryCheckout,
    resetPayment,
    setPaymentMethod,
    clearCartAfterSuccess: clearCart,
    resetProcessingFlag,
  };
};

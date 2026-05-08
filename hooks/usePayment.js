/* global setTimeout */
import { useCallback, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Alert } from "react-native";
import { paymentAtom } from "../recoil/atoms/paymentAtom";
import { profileAtom } from "../recoil/atoms/profileAtom";
import { useCart } from "./useCart";
import { createOrder, verifyPayment, getPaymentStatus } from "../services/bff/paymentBff";

const getRazorpayModule = () => {
  try {
    const mod = require("react-native-razorpay");
    return mod?.default || mod;
  } catch (e) {
    console.warn("[usePayment] react-native-razorpay not available:", e.message);
    return null;
  }
};

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

const PAYMENT_ERROR_KIND = {
  NONE: "NONE",
  CANCELLED: "CANCELLED",
  TIMEOUT: "TIMEOUT",
  FAILED: "FAILED",
  UNCERTAIN: "UNCERTAIN",
  METHOD_UNAVAILABLE: "METHOD_UNAVAILABLE",
  SHOP_CLOSED: "SHOP_CLOSED",
};

const tryParseJson = (value) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return null;
  }
  try {
    return JSON.parse(trimmed);
  } catch (_error) {
    return null;
  }
};

const extractGatewayError = (error) => {
  const parsedMessage = tryParseJson(error?.message);
  const parsedDescription = tryParseJson(error?.description);
  const nested = parsedMessage?.error || parsedDescription?.error || error?.error || null;

  return {
    code: nested?.code || error?.code || null,
    description:
      (typeof nested?.description === "string" && nested.description !== "undefined"
        ? nested.description
        : null) ||
      (typeof error?.description === "string" && error.description !== "undefined"
        ? error.description
        : null),
    reason: nested?.reason || null,
    step: nested?.step || null,
    source: nested?.source || null,
    rawMessage: typeof error?.message === "string" ? error.message : "",
  };
};

const classifyPaymentError = (error) => {
  const gateway = extractGatewayError(error);
  const haystack = [
    gateway.code,
    gateway.description,
    gateway.reason,
    gateway.step,
    gateway.source,
    gateway.rawMessage,
    error?.message,
    error?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    haystack.includes("shop is currently closed") ||
    haystack.includes("shop is closed") ||
    haystack.includes("currently closed") ||
    haystack.includes("business hours")
  ) {
    return {
      kind: PAYMENT_ERROR_KIND.SHOP_CLOSED,
      message: gateway.description || error?.message || "The shop is currently closed. Please try again during business hours.",
      shouldCheckStatus: false,
      shouldAlert: false,
    };
  }

  if (
    error?.code === "PAYMENT_CANCELLED" ||
    error?.code === 0 ||
    error?.code === 2 ||
    haystack.includes("cancelled") ||
    haystack.includes("canceled") ||
    haystack.includes("dismissed") ||
    haystack.includes("user closed")
  ) {
    return {
      kind: PAYMENT_ERROR_KIND.CANCELLED,
      message: "You closed the payment window. Your cart and order are still safe.",
      shouldCheckStatus: false,
      shouldAlert: false,
    };
  }

  if (
    haystack.includes("timed out") ||
    haystack.includes("timeout") ||
    haystack.includes("network") ||
    haystack.includes("unable to connect") ||
    haystack.includes("socket")
  ) {
    return {
      kind: PAYMENT_ERROR_KIND.TIMEOUT,
      message: "The payment is taking longer than expected. We are checking its status now.",
      shouldCheckStatus: true,
      shouldAlert: false,
    };
  }

  if (
    haystack.includes("no app found") ||
    haystack.includes("app not installed") ||
    haystack.includes("no upi app") ||
    haystack.includes("activity not found")
  ) {
    return {
      kind: PAYMENT_ERROR_KIND.METHOD_UNAVAILABLE,
      message: "No supported payment app was available on this device. Try another payment method or use a phone with a UPI app installed.",
      shouldCheckStatus: false,
      shouldAlert: false,
    };
  }

  if (
    gateway.step === "payment_authentication" ||
    gateway.reason === "payment_error" ||
    haystack.includes("payment_authentication") ||
    haystack.includes("bad_request_error")
  ) {
    return {
      kind: PAYMENT_ERROR_KIND.UNCERTAIN,
      message: "We could not confirm whether the payment app completed the charge. We are checking your order status now.",
      shouldCheckStatus: true,
      shouldAlert: false,
    };
  }

  return {
    kind: PAYMENT_ERROR_KIND.FAILED,
    message:
      gateway.description ||
      "Payment could not be completed. You can try again or choose another payment method.",
    shouldCheckStatus: false,
    shouldAlert: true,
  };
};

const resolveStatusOutcome = (statusResult) => {
  const status = String(statusResult?.data?.paymentStatus || "").toUpperCase();
  if (status === "COMPLETED" || status === "CAPTURED" || status === "SUCCESS") {
    return "SUCCESS";
  }
  if (status === "FAILED" || status === "REFUNDED") {
    return "FAILED";
  }
  if (status === "AUTHORIZED" || status === "PENDING") {
    return "PENDING";
  }
  return "UNKNOWN";
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
      errorKind: PAYMENT_ERROR_KIND.NONE,
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
  const buildOrderPayload = useCallback((checkoutOptions = {}) => {
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
      paymentMethod: checkoutOptions.paymentMethod || payment.paymentMethod || "ONLINE",
      shippingAddress: { addressId: checkoutOptions.addressId || profile?.addressId || null },
    };
  }, [cart, cartData, cartTotal, profile, payment.paymentMethod]);

  /**
   * Detect if a Razorpay error is a user-initiated cancellation.
   */
  const fallbackVerify = useCallback(
    async (orderId, maxAttempts = 6) => {
      console.log("[usePayment] Starting fallback verification for order:", orderId);
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise((r) => setTimeout(r, 3000 * attempt)); // backoff: 3s, 6s, 9s...
        try {
          const statusResult = await withTimeout(
            getPaymentStatus(orderId),
            10000,
            "Payment status check"
          );
          if (statusResult.success) {
            const status = statusResult.data?.paymentStatus;
            console.log(`[usePayment] Fallback attempt ${attempt}: status=${status}`);
            const outcome = resolveStatusOutcome(statusResult);
            if (outcome === "SUCCESS") {
              return { outcome, data: statusResult.data };
            }
            if (outcome === "FAILED") {
              return { outcome, data: statusResult.data };
            }
            if (outcome === "PENDING") {
              continue;
            }
          }
        } catch (e) {
          console.warn(`[usePayment] Fallback attempt ${attempt} failed:`, e.message);
        }
      }
      return { outcome: "UNKNOWN", data: null };
    },
    []
  );

  const applyFailureState = useCallback((kind, message) => {
    setPayment((prev) => ({
      ...prev,
      checkoutState: kind === PAYMENT_ERROR_KIND.CANCELLED ? "CANCELLED" : "FAILED",
      error: message,
      errorKind: kind,
    }));
  }, [setPayment]);

  const applyPendingConfirmationState = useCallback((message) => {
    setPayment((prev) => ({
      ...prev,
      checkoutState: "PENDING_CONFIRMATION",
      error:
        message ||
        "We are still checking your payment with the bank. Please do not pay again for this order yet.",
      errorKind: PAYMENT_ERROR_KIND.UNCERTAIN,
    }));
  }, [setPayment]);

  const finalizeSuccessfulPayment = useCallback((order, paymentData = null) => {
    console.log("[usePayment] ✓ Payment successful!");
    setPayment((prev) => ({
      ...prev,
      checkoutState: "SUCCESS",
      currentOrder: { ...order, payment: paymentData || order.payment || null },
      error: null,
      errorKind: PAYMENT_ERROR_KIND.NONE,
    }));
    lastCreatedOrder.current = null;
  }, [setPayment]);

  /**
   * Main checkout function – call this from the Place Order button.
   */
  const startCheckout = useCallback(async (checkoutOptions = {}) => {
    if (isProcessing.current) {
      console.log("[usePayment] Checkout already in progress, skipping");
      return { success: false, error: "Checkout already in progress" };
    }
    isProcessing.current = true;
    let checkoutSucceeded = false;

    try {
      // ── Pre-validation ──
      if (!profile?.userId) {
        throw new Error("Please log in to place an order");
      }

      const orderPayload = buildOrderPayload(checkoutOptions);

      if (!orderPayload.user?.userId) {
        throw new Error("Please complete your profile to place an order");
      }

      if (!orderPayload.orderItems?.length) {
        throw new Error("Your cart is empty");
      }
      if (!orderPayload.shippingAddress?.addressId) {
        throw new Error("Please select a delivery address");
      }

      // ── Step 1: Create order on backend ──
      setPayment((prev) => ({
        ...prev,
        checkoutState: "CREATING_ORDER",
        error: null,
        errorKind: PAYMENT_ERROR_KIND.NONE,
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
          throw new Error(errMsg);
        }
        if (orderResult.error?.status >= 500) {
          throw new Error("Our servers are busy. Please try again in a moment.");
        }
        throw new Error(errMsg);
      }

      const order = orderResult.data;
      if (orderPayload.paymentMethod === "COD") {
        setPayment((prev) => ({
          ...prev,
          checkoutState: "SUCCESS",
          currentOrder: order,
          razorpayConfig: null,
          error: null,
          errorKind: PAYMENT_ERROR_KIND.NONE,
        }));
        lastCreatedOrder.current = null;
        checkoutSucceeded = true;
        return { success: true, order };
      }

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
        if (fallbackResult.outcome === "SUCCESS") {
          verifyResult = fallbackResult;
        } else if (fallbackResult.outcome === "FAILED") {
          const failureReason =
            fallbackResult.data?.failureReason ||
            "The bank declined or failed the payment. No charge was confirmed.";
          throw Object.assign(new Error(failureReason), {
            paymentKind: PAYMENT_ERROR_KIND.FAILED,
          });
        } else {
          throw Object.assign(
            new Error(
              "We could not confirm the payment yet. If money was debited, it should either appear in your orders shortly or be auto-reversed by your bank."
            ),
            { paymentKind: PAYMENT_ERROR_KIND.UNCERTAIN }
          );
        }
      }

      if (verifyResult?.success === false) {
        throw Object.assign(
          new Error(
            verifyResult.error?.message || "Payment verification failed. Please check your bank statement."
          ),
          { paymentKind: PAYMENT_ERROR_KIND.UNCERTAIN }
        );
      }

      const verifyOutcome = resolveStatusOutcome(verifyResult);
      if (verifyOutcome === "PENDING") {
        const fallbackResult = await fallbackVerify(order.orderId, 6);
        if (fallbackResult.outcome === "SUCCESS") {
          verifyResult = fallbackResult;
        } else if (fallbackResult.outcome === "FAILED") {
          const failureReason =
            fallbackResult.data?.failureReason ||
            "The bank declined or failed the payment. No charge was confirmed.";
          throw Object.assign(new Error(failureReason), {
            paymentKind: PAYMENT_ERROR_KIND.FAILED,
          });
        } else {
          throw Object.assign(
            new Error("Payment is still being confirmed. Please check your orders before retrying."),
            { paymentKind: PAYMENT_ERROR_KIND.UNCERTAIN }
          );
        }
      } else if (verifyOutcome === "FAILED") {
        throw Object.assign(
          new Error("The bank declined or failed the payment. No successful charge was confirmed."),
          { paymentKind: PAYMENT_ERROR_KIND.FAILED }
        );
      } else if (verifyOutcome !== "SUCCESS") {
        throw Object.assign(
          new Error("Payment is still being confirmed. Please check your orders before retrying."),
          { paymentKind: PAYMENT_ERROR_KIND.UNCERTAIN }
        );
      }

      // ── Step 4: Success! ──
      finalizeSuccessfulPayment(order, verifyResult.data);
      checkoutSucceeded = true;
      return { success: true, order: { ...order, payment: verifyResult.data } };
    } catch (error) {
      const classified = error?.paymentKind
        ? {
            kind: error.paymentKind,
            message: error?.message || "Payment failed",
            shouldCheckStatus: error.paymentKind === PAYMENT_ERROR_KIND.UNCERTAIN,
            shouldAlert: false,
          }
        : classifyPaymentError(error);

      const logPayload = {
        message: classified.message,
        code: error?.code,
        kind: classified.kind,
      };
      if (classified.shouldCheckStatus) {
        console.warn("[usePayment] Checkout needs payment follow-up:", logPayload);
      } else {
        console.log("[usePayment] ✗ Checkout failed:", logPayload);
      }

      if (classified.shouldCheckStatus && lastCreatedOrder.current?.orderId) {
        setPayment((prev) => ({
          ...prev,
          checkoutState: "CHECKING_PAYMENT",
          currentOrder: lastCreatedOrder.current,
          error: null,
          errorKind: classified.kind,
        }));
        const fallbackResult = await fallbackVerify(lastCreatedOrder.current.orderId, 6);
        if (fallbackResult.outcome === "SUCCESS") {
          finalizeSuccessfulPayment(lastCreatedOrder.current, fallbackResult.data);
          checkoutSucceeded = true;
          return {
            success: true,
            order: { ...lastCreatedOrder.current, payment: fallbackResult.data },
          };
        }
        if (fallbackResult.outcome === "FAILED") {
          const failureReason =
            fallbackResult.data?.failureReason ||
            "The payment was not completed. No successful charge was confirmed.";
          applyFailureState(PAYMENT_ERROR_KIND.FAILED, failureReason);
          return { success: false, error: failureReason };
        }
        applyPendingConfirmationState(classified.message);
        return {
          success: false,
          pending: true,
          order: lastCreatedOrder.current,
          error: classified.message,
        };
      }

      applyFailureState(classified.kind, classified.message);

      if (classified.kind === PAYMENT_ERROR_KIND.CANCELLED) {
        return { success: false, cancelled: true };
      }

      return { success: false, error: classified.message };
    } finally {
      // Only release the processing lock on failure/cancel.
      // On success, the lock stays until Cart.js calls resetProcessingFlag().
      if (!checkoutSucceeded) {
        isProcessing.current = false;
      }
    }
  }, [buildOrderPayload, setPayment, clearCart, fallbackVerify, profile, applyFailureState, applyPendingConfirmationState, finalizeSuccessfulPayment]);

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
          errorKind: PAYMENT_ERROR_KIND.NONE,
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
        } catch (_verifyError) {
          const fallbackResult = await fallbackVerify(order.orderId);
          if (fallbackResult.outcome === "SUCCESS") {
            verifyResult = fallbackResult;
          } else if (fallbackResult.outcome === "FAILED") {
            const failureReason =
              fallbackResult.data?.failureReason ||
              "The bank declined or failed the payment. No charge was confirmed.";
            throw Object.assign(new Error(failureReason), {
              paymentKind: PAYMENT_ERROR_KIND.FAILED,
            });
          } else {
            throw Object.assign(
              new Error(
                "We could not confirm the payment yet. Please check your order history before retrying."
              ),
              { paymentKind: PAYMENT_ERROR_KIND.UNCERTAIN }
            );
          }
        }

        if (verifyResult?.success === false) {
          throw Object.assign(
            new Error(verifyResult.error?.message || "Verification failed"),
            { paymentKind: PAYMENT_ERROR_KIND.UNCERTAIN }
          );
        }

        const verifyOutcome = resolveStatusOutcome(verifyResult);
        if (verifyOutcome === "PENDING") {
          const fallbackResult = await fallbackVerify(order.orderId, 6);
          if (fallbackResult.outcome === "SUCCESS") {
            verifyResult = fallbackResult;
          } else if (fallbackResult.outcome === "FAILED") {
            const failureReason =
              fallbackResult.data?.failureReason ||
              "The bank declined or failed the payment. No charge was confirmed.";
            throw Object.assign(new Error(failureReason), {
              paymentKind: PAYMENT_ERROR_KIND.FAILED,
            });
          } else {
            throw Object.assign(
              new Error("Payment is still being confirmed. Please check your orders before retrying."),
              { paymentKind: PAYMENT_ERROR_KIND.UNCERTAIN }
            );
          }
        } else if (verifyOutcome === "FAILED") {
          throw Object.assign(
            new Error("The bank declined or failed the payment. No successful charge was confirmed."),
            { paymentKind: PAYMENT_ERROR_KIND.FAILED }
          );
        } else if (verifyOutcome !== "SUCCESS") {
          throw Object.assign(
            new Error("Payment is still being confirmed. Please check your orders before retrying."),
            { paymentKind: PAYMENT_ERROR_KIND.UNCERTAIN }
          );
        }

        finalizeSuccessfulPayment(order, verifyResult.data);
        checkoutSucceeded = true;
        return { success: true, order: { ...order, payment: verifyResult.data } };
      } catch (error) {
        const classified = error?.paymentKind
          ? {
              kind: error.paymentKind,
              message: error?.message || "Retry failed",
              shouldCheckStatus: error.paymentKind === PAYMENT_ERROR_KIND.UNCERTAIN,
            }
          : classifyPaymentError(error);

        if (classified.shouldCheckStatus && order?.orderId) {
          setPayment((prev) => ({
            ...prev,
            checkoutState: "CHECKING_PAYMENT",
            currentOrder: order,
            error: null,
            errorKind: classified.kind,
          }));
          const fallbackResult = await fallbackVerify(order.orderId, 6);
          if (fallbackResult.outcome === "SUCCESS") {
            finalizeSuccessfulPayment(order, fallbackResult.data);
            checkoutSucceeded = true;
            return { success: true, order: { ...order, payment: fallbackResult.data } };
          }
          if (fallbackResult.outcome === "FAILED") {
            const failureReason =
              fallbackResult.data?.failureReason ||
              "The payment was not completed. No successful charge was confirmed.";
            applyFailureState(PAYMENT_ERROR_KIND.FAILED, failureReason);
            return { success: false, error: failureReason };
          }
          applyPendingConfirmationState(classified.message);
          return { success: false, pending: true, order, error: classified.message };
        }

        applyFailureState(classified.kind, classified.message);
        if (classified.kind === PAYMENT_ERROR_KIND.CANCELLED) {
          return { success: false, cancelled: true };
        }
        return { success: false, error: classified.message };
      } finally {
        if (!checkoutSucceeded) {
          isProcessing.current = false;
        }
      }
    }

    // No existing order — full fresh checkout
    return startCheckout();
  }, [startCheckout, setPayment, profile, fallbackVerify, applyFailureState, applyPendingConfirmationState, finalizeSuccessfulPayment]);

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
    errorKind: payment.errorKind,
    isLoading:
      payment.checkoutState === "CREATING_ORDER" ||
      payment.checkoutState === "VERIFYING" ||
      payment.checkoutState === "CHECKING_PAYMENT",
    isAwaitingPayment: payment.checkoutState === "AWAITING_PAYMENT",
    isPendingConfirmation: payment.checkoutState === "PENDING_CONFIRMATION",
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

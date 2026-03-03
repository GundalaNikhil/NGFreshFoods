import { useCallback, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Alert, Linking } from "react-native";

// Safe import — native module is null until app is rebuilt after `npm install`
let RazorpayCheckout = null;
try {
  RazorpayCheckout = require("react-native-razorpay").default;
} catch (e) {
  console.warn("[usePayment] react-native-razorpay not available:", e.message);
}
import { paymentAtom } from "../recoil/atoms/paymentAtom";
import { authAtom } from "../recoil/atoms/authAtom";
import { profileAtom } from "../recoil/atoms/profileAtom";
import { useCart } from "./useCart";
import { createOrder, verifyPayment } from "../services/bff/paymentBff";

/**
 * usePayment – orchestrates the full checkout flow:
 * 1. Build order payload from cart
 * 2. Create order on backend (receives Razorpay order config)
 * 3. Open Razorpay native checkout
 * 4. On success → verify payment on backend
 * 5. Clear cart on success
 */
export const usePayment = () => {
  const [payment, setPayment] = useRecoilState(paymentAtom);
  const authState = useRecoilValue(authAtom);
  const profile = useRecoilValue(profileAtom);
  const { cart, cartData, cartTotal, cartDiscount, clearCart } = useCart();
  const isProcessing = useRef(false);

  const resetPayment = useCallback(() => {
    setPayment({
      checkoutState: "IDLE",
      currentOrder: null,
      razorpayConfig: null,
      error: null,
      paymentMethod: "ONLINE",
    });
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
      productId: item.id || item.productId || null,
      categoryId: item.categoryId || null,
      name: item.name || "Item",
      imageUrl: item.image_url || item.imageUrl || null,
      // Use custQuantity (billing qty) — matches cartTotalSelector logic
      quantity: item.custQuantity || item.quantity || 1,
      price: item.itemPrice || item.base_price || 0,
      // Use custPrice (billing total) — matches cartTotalSelector logic
      totalPrice: item.custPrice || item.totalPrice || 0,
      customizations: item.customizations
        ? JSON.stringify(item.customizations)
        : null,
    }));

    const promoCode = cartData?.promoCode || null;
    const discountAmount = cartData?.discountAmount || 0;

    // Get userId from profile atom (not auth atom)
    const userId = profile?.userId || null;

    console.log("[usePayment] buildOrderPayload:", {
      userId,
      profileState: JSON.stringify({
        userId: profile?.userId,
        email: profile?.email,
        firstName: profile?.firstName,
      }),
      authState: JSON.stringify({
        isAuthenticated: authState?.isAuthenticated,
        hasToken: !!authState?.token,
      }),
      itemCount: items.length,
      cartTotal,
      promoCode,
      discountAmount,
    });

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
   * Main checkout function – call this from the Place Order button.
   */
  const startCheckout = useCallback(async () => {
    if (isProcessing.current) {
      console.log("[usePayment] Checkout already in progress, skipping");
      return;
    }
    isProcessing.current = true;

    console.log("[usePayment] ═══ Starting checkout ═══");
    console.log("[usePayment] Auth state:", {
      isAuthenticated: authState?.isAuthenticated,
      hasToken: !!authState?.token,
    });
    console.log("[usePayment] Profile state:", {
      userId: profile?.userId,
      email: profile?.email,
      phone: profile?.phoneNumber,
    });

    try {
      // ── Step 1: Create order on backend ──
      setPayment((prev) => ({
        ...prev,
        checkoutState: "CREATING_ORDER",
        error: null,
      }));

      const orderPayload = buildOrderPayload();

      console.log("[usePayment] Order payload userId:", orderPayload.user?.userId);

      if (!orderPayload.user?.userId) {
        console.error("[usePayment] ✗ No userId found!", {
          profileUserId: profile?.userId,
          authUserId: authState?.userId,
          authUser: authState?.user,
        });
        throw new Error("Please log in to place an order");
      }

      if (!orderPayload.orderItems?.length) {
        console.error("[usePayment] ✗ Cart is empty");
        throw new Error("Your cart is empty");
      }

      console.log("[usePayment] → Creating order on backend...");
      const orderResult = await createOrder(orderPayload);
      console.log("[usePayment] ← Create order result:", {
        success: orderResult.success,
        orderId: orderResult.data?.orderId,
        rzpOrderId: orderResult.data?.razorPayOrderId,
        error: orderResult.error,
      });

      if (!orderResult.success) {
        throw new Error(orderResult.error?.message || "Failed to create order");
      }

      const order = orderResult.data;
      const razorpayOrderId = order.razorPayOrderId;
      const razorpayKeyId = order.razorpayKeyId || order.payment?.razorpayKeyId;
      const amount = order.totalAmount;

      console.log("[usePayment] Razorpay config:", {
        razorpayOrderId,
        razorpayKeyId: razorpayKeyId ? `${razorpayKeyId.substring(0, 8)}...` : null,
        amount,
      });

      if (!razorpayOrderId || !razorpayKeyId) {
        console.error("[usePayment] ✗ Missing Razorpay config:", {
          razorpayOrderId,
          razorpayKeyId,
          fullOrderResponse: JSON.stringify(order).substring(0, 500),
        });
        throw new Error("Payment configuration missing from server");
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
      };

      console.log("[usePayment] → Opening Razorpay Checkout...");

      if (!RazorpayCheckout) {
        console.error("[usePayment] ✗ RazorpayCheckout native module is NULL. Rebuild required.");
        throw new Error(
          "Payment module not loaded. Please rebuild the app:\n" +
          "npx expo prebuild --clean && npx expo run:android"
        );
      }

      const rzpResponse = await RazorpayCheckout.open(rzpOptions);
      console.log("[usePayment] ← Razorpay response:", {
        hasPaymentId: !!rzpResponse?.razorpay_payment_id,
        hasSignature: !!rzpResponse?.razorpay_signature,
        hasOrderId: !!rzpResponse?.razorpay_order_id,
      });

      // ── Step 3: Verify payment on backend ──
      setPayment((prev) => ({ ...prev, checkoutState: "VERIFYING" }));

      console.log("[usePayment] → Verifying payment on backend...");
      const verifyResult = await verifyPayment({
        orderId: order.orderId,
        razorpayOrderId: rzpResponse.razorpay_order_id,
        razorpayPaymentId: rzpResponse.razorpay_payment_id,
        razorpaySignature: rzpResponse.razorpay_signature,
      });

      console.log("[usePayment] ← Verify result:", {
        success: verifyResult.success,
        status: verifyResult.data?.paymentStatus,
        error: verifyResult.error,
      });

      if (!verifyResult.success) {
        throw new Error(
          verifyResult.error?.message || "Payment verification failed"
        );
      }

      // ── Step 4: Success! ──
      console.log("[usePayment] ✓ Payment successful!");
      setPayment((prev) => ({
        ...prev,
        checkoutState: "SUCCESS",
        currentOrder: { ...order, payment: verifyResult.data },
      }));

      await clearCart();
      return { success: true, order, payment: verifyResult.data };
    } catch (error) {
      const errorMessage =
        error?.description || error?.message || "Payment failed";

      console.error("[usePayment] ✗ Checkout failed:", {
        message: errorMessage,
        code: error?.code,
        description: error?.description,
        stack: error?.stack?.substring(0, 300),
      });

      setPayment((prev) => ({
        ...prev,
        checkoutState: "FAILED",
        error: errorMessage,
      }));

      if (
        error?.code !== "PAYMENT_CANCELLED" &&
        !errorMessage.includes("cancelled")
      ) {
        Alert.alert("Payment Failed", errorMessage, [{ text: "OK" }]);
      }

      return { success: false, error: errorMessage };
    } finally {
      isProcessing.current = false;
    }
  }, [buildOrderPayload, setPayment, clearCart, authState, profile]);

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
    startCheckout,
    resetPayment,
    setPaymentMethod,
  };
};

import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useCart } from "../../hooks/useCart";
import { usePayment } from "../../hooks/usePayment";
import { fetchActiveCoupons, validateCoupon } from "../../services/bff/couponsBff";
import CartFooter from "./CartFooter";
import CartItems from "./CartItems";
import CartPromoCode from "./CartPromoCode";
import CartSummary from "./CartSummary";
import CheckoutSheet from "./CheckoutSheet";
import OffersModal from "./Offers/OffersModal";
import OrderSuccessScreen from "./OrderSuccessScreen";
import OrderDetailScreen from "./OrderDetailScreen";
import AddressHeader from "../Home/AddressHeader";
import AddressSelectionSheet from "../Home/AddressSelectionSheet";
import AddAddressModal from "../Home/AddAddressModal";
import { useAddress } from "../../hooks/useAddress";

const Cart = () => {
  const { cart, cartData, cartTotal, cartDiscount, applyCoupon, removeCoupon } = useCart();
  const {
    checkoutState,
    paymentMethod,
    error: paymentError,
    currentOrder,
    startCheckout,
    retryCheckout,
    resetPayment,
    setPaymentMethod,
    clearCartAfterSuccess,
    resetProcessingFlag,
    isCancelled: isPaymentCancelled,
  } = usePayment();
  const { addAddress, selectedAddress } = useAddress();

  const [isOffersModalVisible, setIsOffersModalVisible] = useState(false);
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  // ... rest of the component state ...
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const lastValidatedTotalRef = useRef(null);
  const inFlightRef = useRef(false);

  // ── Screen navigation state ──
  // "cart" | "success" | "detail"
  const [activeScreen, setActiveScreen] = useState("cart");
  const [viewingOrder, setViewingOrder] = useState(null);
  const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);

  // Get current promo/offer state from cart
  const selectedOffer = cartData?.offer || null;
  const promoDiscount = cartData?.discountAmount || 0;
  const promoCode = cartData?.promoCode || "";

  // Extract cart items for validation
  const cartItems = cart || [];

  useEffect(() => {
    if (cartItems.length === 0 && (selectedOffer || promoCode)) {
      removeCoupon();
    }
  }, [cartItems.length, selectedOffer, promoCode, removeCoupon]);

  useEffect(() => {
    if (selectedOffer) {
      const minAmount = Number(selectedOffer.minOrderAmount || 0);
      if (cartTotal < minAmount) {
        removeCoupon();
      }
    }
  }, [cartTotal, selectedOffer, removeCoupon]);

  useEffect(() => {
    let isActive = true;
    const revalidate = async () => {
      if (!selectedOffer || cartTotal <= 0) return;
      if (inFlightRef.current) return;
      const code = selectedOffer.code || selectedOffer.promoCode;
      if (!code) return;
      if (lastValidatedTotalRef.current === cartTotal) return;
      inFlightRef.current = true;
      const response = await validateCoupon({
        code,
        orderAmount: cartTotal,
      });
      inFlightRef.current = false;
      if (!isActive) return;
      lastValidatedTotalRef.current = cartTotal;
      if (response.success && response.data?.valid) {
        applyCoupon(response.data.coupon, response.data.discountAmount);
      } else {
        removeCoupon();
      }
    };

    const timer = setTimeout(revalidate, 800);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [cartTotal, selectedOffer, applyCoupon, removeCoupon]);

  const loadCoupons = async (forceRefresh = false) => {
    setCouponsLoading(true);
    setCouponsError("");
    const response = await fetchActiveCoupons({ forceRefresh });
    if (response.success) {
      setAvailableCoupons(response.data || []);
    } else {
      setCouponsError(response.error.message || "Failed to load coupons.");
    }
    setCouponsLoading(false);
  };

  useEffect(() => {
    loadCoupons(false);
  }, []);

  const handleOfferSelect = async (offer) => {
    setIsApplyingCoupon(true);
    const response = await validateCoupon({
      code: offer.code,
      orderAmount: cartTotal,
    });
    setIsApplyingCoupon(false);
    if (response.success && response.data?.valid) {
      removeCoupon();
      applyCoupon(response.data.coupon, response.data.discountAmount);
      setIsOffersModalVisible(false);
    }
  };

  const handlePromoCodeApply = async (promoData) => {
    setIsApplyingCoupon(true);
    const response = await validateCoupon({
      code: promoData.promoCode,
      orderAmount: cartTotal,
    });
    setIsApplyingCoupon(false);
    if (response.success && response.data?.valid) {
      applyCoupon(response.data.coupon, response.data.discountAmount);
      return {
        ok: true,
        message: response.data.message || "Coupon applied",
        discount: response.data.discountAmount,
        coupon: response.data.coupon,
      };
    }

    return {
      ok: false,
      message:
        response?.data?.message ||
        response?.error?.message ||
        "Invalid coupon",
    };
  };

  const getItemCount = () => {
    return cart.length;
  };

  const itemCount = getItemCount();
  const MIN_ORDER_FOR_FREE_DELIVERY = 500.0;
  const DELIVERY_FEE = cartTotal >= MIN_ORDER_FOR_FREE_DELIVERY ? 0 : 25.0;
  const ENABLE_TAXES = false; // Flag to disable taxes for now
  const TAX_RATE = ENABLE_TAXES ? 0.05 : 0;
  const grandTotal = (cartTotal - promoDiscount + DELIVERY_FEE) * (1 + TAX_RATE);

  // ── Checkout handlers ──

  const handlePlaceOrder = () => {
    setIsCheckoutVisible(true);
  };

  const handlePayOnline = async () => {
    if (isCheckoutInProgress) return;
    setIsCheckoutInProgress(true);
    try {
      await startCheckout();
    } finally {
      // Keep isCheckoutInProgress true until we navigate away or reset
    }
  };

  const handleRetryPayment = async () => {
    if (isCheckoutInProgress) return;
    setIsCheckoutInProgress(true);
    try {
      await retryCheckout();
    } finally {
      // Resets when sheet closes or success
    }
  };

  const handleCheckoutClose = () => {
    if (checkoutState !== "CREATING_ORDER" && checkoutState !== "VERIFYING") {
      setIsCheckoutVisible(false);
      setIsCheckoutInProgress(false);
      resetProcessingFlag();
    }
  };

  // ── Navigate to Order Success Screen after payment ──
  const handleViewOrder = (order) => {
    setIsCheckoutVisible(false);
    setViewingOrder(order);
    setActiveScreen("success");
    resetPayment();
    setIsCheckoutInProgress(false);
    resetProcessingFlag(); // Release the processing lock in usePayment
    // Clear cart AFTER we've navigated away from the cart view
    setTimeout(() => {
      clearCartAfterSuccess();
      loadCoupons(true); // Immediate refresh to hide first-order-only coupons like WELCOME50
    }, 300);
  };

  // ── Auto-trigger navigation on payment success ──
  useEffect(() => {
    if (checkoutState === "SUCCESS" && currentOrder) {
      const timer = setTimeout(() => {
        handleViewOrder(currentOrder);
      }, 1800); // Show checkmark briefly in sheet, then navigate
      return () => clearTimeout(timer);
    }
  }, [checkoutState, currentOrder]);

  // ── Render OrderSuccessScreen ──
  if (activeScreen === "success" && viewingOrder) {
    return (
      <OrderSuccessScreen
        order={viewingOrder}
        onTrackOrder={() => {
          setActiveScreen("detail");
        }}
        onGoHome={() => {
          setViewingOrder(null);
          setActiveScreen("cart");
        }}
      />
    );
  }

  // ── Render OrderDetailScreen ──
  if (activeScreen === "detail" && viewingOrder) {
    return (
      <OrderDetailScreen
        orderId={viewingOrder?.orderId}
        order={viewingOrder}
        onBack={() => {
          setViewingOrder(null);
          setActiveScreen("cart");
        }}
      />
    );
  }

  // ── Render Cart ──
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Dynamic Address Header */}
      <View className="px-5 py-2 border-b border-[#E9E9EB] bg-white">
        <AddressHeader 
          onAddressPress={() => setShowAddressSheet(true)} 
        />
      </View>

      {cart.length > 0 || checkoutState === "SUCCESS" || isCheckoutInProgress || isPaymentCancelled ? (
        <>
          <ScrollView
            className="flex-1 bg-[#F5F5F5]"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <View className="bg-white mb-2">
              <CartItems />
            </View>

            <View className="bg-white mb-2">
              <CartPromoCode
                onApplyPromo={handlePromoCodeApply}
                onShowOffers={() => setIsOffersModalVisible(true)}
                selectedOffer={selectedOffer}
                promoCode={promoCode}
                discountAmount={promoDiscount}
                onRemovePromo={removeCoupon}
                cartTotal={cartTotal}
                availableCoupons={availableCoupons}
                couponsLoading={couponsLoading}
                isApplying={isApplyingCoupon}
                couponsError={couponsError}
                onReloadCoupons={() => loadCoupons(true)}
              />
            </View>

            <View className="bg-white mb-4">
              <CartSummary
                subtotal={cartTotal}
                discount={cartDiscount}
                promoDiscount={promoDiscount}
                selectedOffer={selectedOffer}
                deliveryFee={DELIVERY_FEE}
                taxRate={TAX_RATE}
              />
              
              {/* High-Fidelity Delivery Speed Highlight */}
              <View className="px-5 py-8 items-center flex-row justify-between border-t border-[#F5F5F5]">
                <View className="flex-1 pr-4">
                  <View className="bg-[#FFF0F1] self-start px-2 py-0.5 rounded-full mb-2">
                    <Text className="text-[10px] text-[#E23744] font-black uppercase tracking-widest">
                      ⚡ Super Fast
                    </Text>
                  </View>
                  <Text className="text-[20px] font-black text-[#1C1C1C] mb-1">
                    Delivery in 30 mins
                  </Text>
                  <Text className="text-[13px] text-[#686B78] font-medium leading-relaxed">
                    Quick as a flash! Our delivery partner is ready to bring your fresh farm foods.
                  </Text>
                </View>
                <Image 
                  source={require("../../assets/images/delivery_character.png")} 
                  className="w-28 h-28"
                  resizeMode="contain"
                />
              </View>
            </View>
            
            {/* Cancellation Policy */}
            <View className="px-4 pb-8">
              <View className="bg-white p-4 rounded-xl border border-[#E9E9EB]">
                <Text className="text-[14px] font-bold text-[#1C1C1C] mb-1">
                  Cancellation Policy
                </Text>
                <Text className="text-[12px] text-[#686B78] leading-relaxed">
                  Help us reduce food waste. Avoid cancellations after placing your order. A 100% cancellation fee may apply.
                </Text>
              </View>
            </View>
          </ScrollView>

          <CartFooter
            totalPayable={grandTotal}
            itemCount={itemCount}
            onPlaceOrder={handlePlaceOrder}
          />

          <CheckoutSheet
            visible={isCheckoutVisible}
            onClose={handleCheckoutClose}
            onPayOnline={handlePayOnline}
            onRetry={handleRetryPayment}
            totalPayable={grandTotal}
            itemCount={itemCount}
            checkoutState={checkoutState}
            error={paymentError}
            paymentMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            onReset={resetPayment}
            onViewOrder={handleViewOrder}
            currentOrder={currentOrder}
            selectedAddress={selectedAddress}
            onSelectAddress={() => setShowAddressSheet(true)}
          />

          <AddressSelectionSheet
            visible={showAddressSheet}
            onClose={() => setShowAddressSheet(false)}
            onAddPress={() => setShowAddAddressModal(true)}
          />

          <AddAddressModal
            visible={showAddAddressModal}
            onClose={() => setShowAddAddressModal(false)}
            onAdd={addAddress}
          />

          <OffersModal
            visible={isOffersModalVisible}
            onClose={() => setIsOffersModalVisible(false)}
            onSelectOffer={handleOfferSelect}
            selectedOffer={selectedOffer}
            cartTotal={cartTotal}
            offers={availableCoupons}
            loading={couponsLoading}
            isApplying={isApplyingCoupon}
            error={couponsError}
            onReload={() => loadCoupons(true)}
          />
        </>
      ) : (
        <View className="flex-1 items-center justify-center p-8">
          <Image 
            source={require("../../assets/images/characters/orders/empty.png")} 
            style={{ width: 180, height: 180, marginBottom: 24 }}
            resizeMode="contain"
          />
          <Text className="text-xl font-bold text-[#1C1C1C]">Your cart is lonely</Text>
          <Text className="text-[#686B78] text-center mt-2 leading-relaxed">
            Your kitchen is waiting for some fresh farm foods. Let's add some delicious meat, chicken or eggs to your cart!
          </Text>
          <TouchableOpacity className="mt-8 bg-[#E23744] px-10 py-4 rounded-2xl" style={{ shadowColor: '#E23744', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}>
            <Text className="text-white font-bold text-base">Browse Categories</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Cart;

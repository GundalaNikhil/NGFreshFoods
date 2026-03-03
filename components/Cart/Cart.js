import { ChevronDown, ChevronLeft, MapPin } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../hooks/useCart";
import { usePayment } from "../../hooks/usePayment";
import { fetchActiveCoupons, validateCoupon } from "../../services/bff/couponsBff";
import CartFooter from "./CartFooter";
import CartItems from "./CartItems";
import CartPromoCode from "./CartPromoCode";
import CartSummary from "./CartSummary";
import CheckoutSheet from "./CheckoutSheet";
import OffersModal from "./Offers/OffersModal";

const Cart = () => {
  const { cart, cartData, cartTotal, cartDiscount, applyCoupon, removeCoupon } = useCart();
  const {
    checkoutState,
    paymentMethod,
    error: paymentError,
    startCheckout,
    resetPayment,
    setPaymentMethod,
  } = usePayment();

  const [isOffersModalVisible, setIsOffersModalVisible] = useState(false);
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const lastValidatedTotalRef = useRef(null);
  const inFlightRef = useRef(false);

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
  const DELIVERY_FEE = 25.0;
  const TAX_RATE = 0.05;
  const grandTotal = (cartTotal - promoDiscount + DELIVERY_FEE) * (1 + TAX_RATE);

  // ── Checkout handlers ──

  const handlePlaceOrder = () => {
    setIsCheckoutVisible(true);
  };

  const handlePayOnline = async () => {
    const result = await startCheckout();
    if (result?.success) {
      // CheckoutSheet will show success state
    }
  };

  const handleCheckoutClose = () => {
    if (checkoutState !== "CREATING_ORDER" && checkoutState !== "VERIFYING") {
      setIsCheckoutVisible(false);
    }
  };

  // Close checkout sheet on success after a delay
  useEffect(() => {
    if (checkoutState === "SUCCESS") {
      const timer = setTimeout(() => {
        // Sheet stays visible showing success state, user closes manually via "Done"
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [checkoutState]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Stylish Address Header */}
      <View className="px-4 py-3 flex-row items-center border-b border-gray-100 bg-white shadow-sm z-10">
        <TouchableOpacity 
          onPress={() => console.log("Go Back")} 
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50 mr-3 border border-gray-100"
        >
          <ChevronLeft size={22} color="#1C1C1C" strokeWidth={2.5} />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-1 justify-center">
          <View className="flex-row items-center mb-0.5">
            <Text className="text-[14px] font-black text-gray-900 mr-1 tracking-tight">
              Home
            </Text>
            <ChevronDown size={16} color="#E23744" strokeWidth={3} />
            </View>
          <Text className="text-[12px] text-gray-500 font-medium tracking-tight" numberOfLines={1}>
            123, Fresh Farms Street, NG Layout...
          </Text>
          </TouchableOpacity>

        <TouchableOpacity className="w-10 h-10 rounded-full bg-red-50 items-center justify-center border border-red-100 ml-2">
          <MapPin size={18} color="#E23744" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {cart.length > 0 ? (
        <>
          <ScrollView
            className="flex-1 bg-gray-50"
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
              <View className="px-5 py-8 items-center flex-row justify-between border-t border-gray-50">
                <View className="flex-1 pr-4">
                  <View className="bg-green-50 self-start px-2 py-0.5 rounded-full mb-2">
                    <Text className="text-[10px] text-green-700 font-black uppercase tracking-widest">
                      Super Fast
                    </Text>
                  </View>
                  <Text className="text-[20px] font-black text-gray-900 mb-1">
                    Delivery in 30 mins
                  </Text>
                  <Text className="text-[13px] text-gray-500 font-medium leading-relaxed">
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
              <View className="bg-white p-4 rounded-xl border border-gray-100">
                <Text className="text-[14px] font-bold text-gray-800 mb-1">
                  Cancellation Policy
                </Text>
                <Text className="text-[12px] text-gray-500 leading-relaxed">
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
            totalPayable={grandTotal}
            itemCount={itemCount}
            checkoutState={checkoutState}
            error={paymentError}
            paymentMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            onReset={resetPayment}
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
          <Text className="text-xl font-bold text-gray-900">Your cart is lonely</Text>
          <Text className="text-gray-500 text-center mt-2 leading-relaxed">
            Your kitchen is waiting for some fresh farm foods. Let's add some delicious meat, chicken or eggs to your cart!
          </Text>
          <TouchableOpacity className="mt-8 bg-green-600 px-10 py-4 rounded-2xl shadow-sm">
            <Text className="text-white font-bold text-base">Browse Categories</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Cart;

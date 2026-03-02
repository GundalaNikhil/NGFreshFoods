import React, { useState, useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { cartState } from "../recoil/atoms/cartAtom";
import { fetchActiveCoupons } from "../services/bff/couponsBff";
import {
  validatePromoCode,
  calculateChickenWeight,
  isWeekend,
} from "../utils/promoHelper";

export const useOffers = () => {
  const [cart, setCart] = useRecoilState(cartState);
  const [availableOffers, setAvailableOffers] = useState([]);

  useEffect(() => {
    let isActive = true;

    const loadOffers = async () => {
      const response = await fetchActiveCoupons();
      if (!isActive) return;

      if (response?.success && Array.isArray(response.data)) {
        const normalized = response.data.map((coupon) => ({
          ...coupon,
          promoCode: coupon.code || coupon.promoCode,
          flag: coupon.isActive ?? true,
          isPromoCode: true,
        }));
        setAvailableOffers(normalized);
      } else {
        setAvailableOffers([]);
      }
    };

    loadOffers();

    return () => {
      isActive = false;
    };
  }, []);

  const calculateOfferDiscount = useCallback(
    (offer, cartTotal) => {
      if (!offer) return 0;

      // Handle validated promo codes
      if (offer.isPromoCode && offer.discount) {
        return offer.discount;
      }

      // Handle manual promo codes (legacy support)
      if (offer.isPromoCode) {
        const PROMO_CODES = {
          WELCOME50: 50,
          SAVE100: 100,
          FRESH20: 20,
        };
        return PROMO_CODES[offer.promoCode] || 0;
      }

      // Handle offers from modal with dynamic validation
      const cartItems = cart || {};
      const chickenWeight = calculateChickenWeight(cartItems);

      switch (offer.promoCode) {
        case "WELCOME50":
          return 50; // Fixed discount for first-time users

        case "B1G1FRESH":
          if (chickenWeight >= 1) {
            // Find cheapest chicken item for BOGO
            const items = Object.values(cartItems).filter(
              (item) => item && typeof item === "object" && item.productId
            );
            const chickenItems = items.filter(
              (item) =>
                item.category_id?.includes("CHICKEN") ||
                item.name?.toLowerCase().includes("chicken")
            );

            if (chickenItems.length > 0) {
              const cheapestItem = chickenItems.reduce((min, item) =>
                (item.base_price || item.itemPrice) < (min.base_price || min.itemPrice)
                  ? item
                  : min
              );
              return cheapestItem.base_price || cheapestItem.itemPrice || 0;
            }
          }
          return 0;

        case "EGGSTRA4YOU":
          return chickenWeight >= 1 ? 25 : 0;

        case "DOUBLEDELIGHT":
          return chickenWeight >= 2 ? 100 : 0;

        case "WEEKENDFEAST":
          return isWeekend() ? Math.min(cartTotal * 0.15, 200) : 0;

        // Legacy offer codes
        case "WEEKENDfeast":
          return Math.min(cartTotal * 0.2, 500);
        case "SAVE300NOW":
          return cartTotal >= 1000 ? 300 : 0;
        case "BULKBUY10":
          return cartTotal * 0.1;
        case "HOLIDAY15":
          return cartTotal * 0.15;
        default:
          return 0;
      }
    },
    [cart]
  );

  const applyOffer = useCallback(
    (offer, cartTotal) => {
      if (!offer) return 0;

      let discount = 0;

      // If it's a validated promo code, use the pre-calculated discount
      if (offer.isPromoCode && offer.discount) {
        discount = offer.discount;
      } else {
        discount = calculateOfferDiscount(offer, cartTotal);
      }

      setCart((prevCart) => ({
        ...prevCart,
        appliedOffer: true,
        promoCode: offer.promoCode,
        offer: offer,
        discountAmount: discount,
      }));

      return discount;
    },
    [calculateOfferDiscount, setCart]
  );

  const removeOffer = useCallback(() => {
    setCart((prevCart) => ({
      ...prevCart,
      appliedOffer: false,
      promoCode: null,
      offer: null,
      discountAmount: 0,
    }));
  }, [setCart]);

  const getAvailableOffers = useCallback(() => {
    return availableOffers.filter((offer) => offer.flag !== false);
  }, [availableOffers, cart]);

  // Validate if a promo code can be applied
  const validatePromo = useCallback(
    (promoCode, userProfile, cartTotal) => {
      const cartItems = cart || {};
      return validatePromoCode(promoCode, cartItems, userProfile, cartTotal);
    },
    [cart]
  );

  // Get cart insights for UI
  const getCartInsights = useCallback(() => {
    const cartItems = cart || {};
    return {
      chickenWeight: calculateChickenWeight(cartItems),
      isWeekend: isWeekend(),
      totalItems: Object.keys(cartItems).filter(
        (key) =>
          cartItems[key] &&
          typeof cartItems[key] === "object" &&
          cartItems[key].productId
      ).length,
    };
  }, [cart]);

  // Debug logging
  React.useEffect(() => {
    console.log("Cart State:", cart);
    console.log("Cart Insights:", getCartInsights());
  }, [cart, getCartInsights]);

  return {
    applyOffer,
    removeOffer,
    calculateOfferDiscount,
    getAvailableOffers,
    validatePromo,
    getCartInsights,
  };
};

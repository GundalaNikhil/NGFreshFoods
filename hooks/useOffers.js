import React, { useState, useCallback } from "react";
import { OffersData } from "../components/data/OffersData";
import { useRecoilState } from "recoil";
import { cartState } from "../recoil/atoms/cartAtom";

export const useOffers = () => {
  const [cart, setCart] = useRecoilState(cartState);

  const calculateOfferDiscount = useCallback((offer, cartTotal) => {
    if (!offer) return 0;

    // Handle manual promo codes
    if (offer.isPromoCode) {
      const PROMO_CODES = {
        WELCOME50: 50,
        SAVE100: 100,
        FRESH20: 20,
      };
      return PROMO_CODES[offer.promoCode] || 0;
    }

    // Handle offers from modal
    switch (offer.promoCode) {
      case "WELCOME50":
        return Math.min(cartTotal * 0.5, 500);
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
  }, []);

  const applyOffer = useCallback(
    (offer, cartTotal) => {
      if (!offer) return 0;

      const discount = calculateOfferDiscount(offer, cartTotal);

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
    return OffersData.filter((offer) => offer.flag === true);
  }, []);

  // Debug logging
  React.useEffect(() => {
    console.log("Cart State:", cart);
  }, [cart]);

  return {
    applyOffer,
    removeOffer,
    calculateOfferDiscount,
    getAvailableOffers,
  };
};

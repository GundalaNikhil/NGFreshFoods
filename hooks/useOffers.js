import React, { useState, useCallback } from "react";
import { OffersData } from "../components/data/OffersData";
import { useRecoilState } from "recoil";
import { cartState } from "../recoil/atoms/cartAtom";

export const useOffers = () => {
  const [cart, setCart] = useRecoilState(cartState);
  const [offerApplied, setOfferApplied] = useState(false);
  const [promocode, setPromocode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const calculateOfferDiscount = useCallback((offer, cartTotal) => {
    if (!offer) return 0;

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
      const discount = calculateOfferDiscount(offer, cartTotal);
      setPromocode(offer);
      setDiscountAmount(discount);
      setOfferApplied(true);

      setCart((prevCart) => ({
        ...prevCart,
        appliedOffer: true,
        promoCode: offer?.promoCode || null,
        offer: offer,
        discountAmount: discount,
      }));

      return discount;
    },
    [calculateOfferDiscount, setCart]
  );

  const removeOffer = useCallback(() => {
    setSelectedOffer(null);
    setAppliedDiscount(0);
    setCart((prevCart) => ({
      ...prevCart,
      appliedOffer: false,
      promoCode: null,
      discountAmount: 0,
    }));
  }, [setCart]);

  const getAvailableOffers = useCallback(() => {
    return OffersData.filter((offer) => offer.flag === true);
  }, []);

  React.useEffect(() => {
    console.log("Offer Applied:", offerApplied);
    console.log("Applied Discount:", discountAmount);
    console.log("Promocode:", promocode);
    console.log("CArt :", cart);
  }, [cart]);

  return {
    applyOffer,
    removeOffer,
    calculateOfferDiscount,
    getAvailableOffers,
  };
};

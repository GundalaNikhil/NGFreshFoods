import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import CartItems from "./CartItems";
import CartPromoCode from "./CartPromoCode";
import CartSummary from "./CartSummary";
import CartFooter from "./CartFooter";
import OffersModal from "./Offers/OffersModal";
import { useCart } from "../../hooks/useCart";
import { useOffers } from "../../hooks/useOffers";

const Cart = () => {
  const { cart, cartData, cartTotal, cartDiscount } = useCart();
  const { applyOffer, removeOffer, calculateOfferDiscount } = useOffers();
  const [isOffersModalVisible, setIsOffersModalVisible] = useState(false);

  // Get current promo/offer state from cart
  const selectedOffer = cartData?.offer || null;
  const promoDiscount = cartData?.discountAmount || 0;
  const promoCode = cartData?.promoCode || "";

  const handleOfferSelect = (offer) => {
    const discount = calculateOfferDiscount(offer, cartTotal);
    applyOffer(offer, cartTotal);
    setIsOffersModalVisible(false);
  };

  const handlePromoCodeApply = (promoData) => {
    // Create a mock offer object for promo codes
    const promoOffer = {
      id: `promo_${promoData.promoCode}`,
      title: `Promo Code: ${promoData.promoCode}`,
      promoCode: promoData.promoCode,
      description: `Flat ₹${promoData.discount} off`,
      isPromoCode: true,
    };

    applyOffer(promoOffer, cartTotal);
  };

  const handleRemovePromo = () => {
    removeOffer();
  };

  const handleShowOffers = () => {
    setIsOffersModalVisible(true);
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <CartItems />

        <CartPromoCode
          onApplyPromo={handlePromoCodeApply}
          onShowOffers={handleShowOffers}
          selectedOffer={selectedOffer}
          promoCode={promoCode}
          discountAmount={promoDiscount}
          onRemovePromo={handleRemovePromo}
        />

        <CartSummary
          subtotal={cartTotal}
          discount={cartDiscount}
          promoDiscount={promoDiscount}
          selectedOffer={selectedOffer}
        />
      </ScrollView>

      <CartFooter
        total={cartTotal - promoDiscount}
        itemCount={cart?.length || 0}
      />

      <OffersModal
        visible={isOffersModalVisible}
        onClose={() => setIsOffersModalVisible(false)}
        onSelectOffer={handleOfferSelect}
        selectedOffer={selectedOffer}
        cartTotal={cartTotal}
      />
    </View>
  );
};

export default Cart;

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

  // Get offer data from the cart state
  const selectedOffer = cartData?.offer || null;
  const promoDiscount = cartData?.discountAmount || 0;
  const promoCode = cartData?.promoCode || "";

  const handleOfferSelect = (offer) => {
    applyOffer(offer, cartTotal);
    setIsOffersModalVisible(false);
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
          onApplyPromo={handleOfferSelect}
          onShowOffers={() => setIsOffersModalVisible(true)}
          selectedOffer={selectedOffer}
          promoCode={promoCode}
          discountAmount={promoDiscount}
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

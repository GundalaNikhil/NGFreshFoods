import React, { useState } from "react";
import { Text, View, ScrollView } from "react-native";
import CartItems from "./CartItems";
import CartPromoCode from "./CartPromoCode";
import CartSummary from "./CartSummary";
import CartFooter from "./CartFooter";
import OffersModal from "./Offers/OffersModal";
import { useCart } from "../../hooks/useCart";
import { useOffers } from "../../hooks/useOffers";
import { debugCartAnalysis } from "../../utils/promoHelper";
import { ShoppingBag } from "lucide-react-native";

const Cart = () => {
  const { cart, cartData, cartTotal, cartDiscount } = useCart();
  const { applyOffer, removeOffer, calculateOfferDiscount } = useOffers();
  const [isOffersModalVisible, setIsOffersModalVisible] = useState(false);

  // Get current promo/offer state from cart
  const selectedOffer = cartData?.offer || null;
  const promoDiscount = cartData?.discountAmount || 0;
  const promoCode = cartData?.promoCode || "";

  // Extract cart items for validation
  const cartItems = cart || cartData || {};

  // Mock user profile - you should replace this with actual user data
  const userProfile = {
    isFirstTime: true, // Set based on actual user data
    isFirstTimeUser: true, // Alternative property name
    // Add other user properties as needed
  };

  // Debug cart analysis (remove in production)
  React.useEffect(() => {
    if (Object.keys(cartItems).length > 0) {
      debugCartAnalysis(cartItems, userProfile);
    }
  }, [cartItems, userProfile]);

  const handleOfferSelect = (offer) => {
    const discount = calculateOfferDiscount(offer, cartTotal);
    applyOffer(offer, cartTotal);
    setIsOffersModalVisible(false);
  };

  const handlePromoCodeApply = (promoData) => {
    // Create a promo offer object with the validated data
    const promoOffer = {
      id: `promo_${promoData.promoCode}`,
      title: promoData.promo?.title || `Promo Code: ${promoData.promoCode}`,
      promoCode: promoData.promoCode,
      description:
        promoData.promo?.description || `Flat ₹${promoData.discount} off`,
      isPromoCode: true,
      discount: promoData.discount,
      type: promoData.promo?.type || "fixed",
    };

    applyOffer(promoOffer, cartTotal);
  };

  const handleRemovePromo = () => {
    removeOffer();
  };

  const handleShowOffers = () => {
    setIsOffersModalVisible(true);
  };

  // Calculate item count properly
  const getItemCount = () => {
    if (Array.isArray(cart)) {
      return cart.length;
    }

    if (typeof cartItems === "object" && cartItems !== null) {
      return Object.keys(cartItems).filter(
        (key) =>
          cartItems[key] &&
          typeof cartItems[key] === "object" &&
          (cartItems[key].productId || cartItems[key].id) &&
          (cartItems[key].quantity > 0 || cartItems[key].custQuantity > 0)
      ).length;
    }

    return 0;
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100">
      {cart.length > 0 ? (
        <>
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
              cartItems={cartItems}
              userProfile={userProfile}
              cartTotal={cartTotal}
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
            itemCount={getItemCount()}
          />

          <OffersModal
            visible={isOffersModalVisible}
            onClose={() => setIsOffersModalVisible(false)}
            onSelectOffer={handleOfferSelect}
            selectedOffer={selectedOffer}
            cartTotal={cartTotal}
            cartItems={cartItems}
            userProfile={userProfile}
          />
        </>
      ) : (
        <View className="items-center justify-center py-16">
          <ShoppingBag size={64} color="#cbd5e1" />
          <Text className="text-lg font-semibold text-gray-500 mt-4">
            Your cart is empty
          </Text>
          <Text className="text-sm text-gray-400 mt-1">
            Add some delicious items to get started
          </Text>
        </View>
      )}
    </View>
  );
};

export default Cart;

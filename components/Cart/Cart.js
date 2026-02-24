import { ChevronDown, ChevronLeft, MapPin, ShoppingBag } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../hooks/useCart";
import { useOffers } from "../../hooks/useOffers";
import { debugCartAnalysis, validatePromoCode } from "../../utils/promoHelper";
import AddressHeader from "../Home/AddressHeader";
import CartFooter from "./CartFooter";
import CartItems from "./CartItems";
import CartPromoCode from "./CartPromoCode";
import CartSummary from "./CartSummary";
import OffersModal from "./Offers/OffersModal";

const Cart = () => {
  const { cart, cartData, cartTotal, cartDiscount, clearCart } = useCart();
  const { applyOffer, removeOffer, calculateOfferDiscount } = useOffers();
  const [isOffersModalVisible, setIsOffersModalVisible] = useState(false);

  // Get current promo/offer state from cart
  const selectedOffer = cartData?.offer || null;
  const promoDiscount = cartData?.discountAmount || 0;
  const promoCode = cartData?.promoCode || "";

  // Extract cart items for validation
  const cartItems = cart || cartData || {};

  // Mock user profile
  const userProfile = {
    isFirstTime: true,
    isFirstTimeUser: true,
  };

  useEffect(() => {
    if ((selectedOffer || promoCode) && Object.keys(cartItems).length > 0) {
      let currentPromoCode = selectedOffer?.promoCode || promoCode;
      
      if (currentPromoCode) {
        const validation = validatePromoCode(
          currentPromoCode,
          cartItems,
          userProfile,
          cartTotal
        );

        if (!validation.isValid) {
          removeOffer();
        }
      }
    }
  }, [cartItems, cartTotal, selectedOffer, promoCode, userProfile, removeOffer]);

  useEffect(() => {
    if (Object.keys(cartItems).length === 0 && (selectedOffer || promoCode)) {
      removeOffer();
    }
  }, [cartItems, selectedOffer, promoCode, removeOffer]);

  const handleOfferSelect = (offer) => {
    applyOffer(offer, cartTotal);
    setIsOffersModalVisible(false);
  };

  const handlePromoCodeApply = (promoData) => {
    const promoOffer = {
      id: `promo_${promoData.promoCode}`,
      title: promoData.promo?.title || `Promo Code: ${promoData.promoCode}`,
      promoCode: promoData.promoCode,
      description: promoData.promo?.description || `Flat ₹${promoData.discount} off`,
      isPromoCode: true,
      discount: promoData.discount,
      type: promoData.promo?.type || "fixed",
    };
    applyOffer(promoOffer, cartTotal);
  };

  const getItemCount = () => {
    return cart.length;
  };

  const itemCount = getItemCount();
  const DELIVERY_FEE = 25.0;
  const TAX_RATE = 0.05;
  const grandTotal = (cartTotal - promoDiscount + DELIVERY_FEE) * (1 + TAX_RATE);

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
                onRemovePromo={removeOffer}
                cartItems={cartItems}
                userProfile={userProfile}
                cartTotal={cartTotal}
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
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
            <ShoppingBag size={48} color="#16A34A" />
          </View>
          <Text className="text-xl font-bold text-gray-900">Your cart is empty</Text>
          <Text className="text-gray-500 text-center mt-2 leading-relaxed">
            Good food is always cooking! Go ahead, order some yummy items from the menu.
          </Text>
          <TouchableOpacity className="mt-8 bg-green-600 px-8 py-3 rounded-xl">
            <Text className="text-white font-bold text-base">Browse Menu</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Cart;
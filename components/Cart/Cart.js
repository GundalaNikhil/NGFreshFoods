// components/Cart/Cart.jsx
import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import CartHeader from "./CartHeader";
import CartItems from "./CartItems";
import CartPromoCode from "./CartPromoCode";
import CartSummary from "./CartSummary";
import CartFooter from "./CartFooter";
import { useCart } from "../../hooks/useCart";

const Cart = () => {
  const { cart, cartTotal, cartDiscount } = useCart();
  const [promoDiscount, setPromoDiscount] = useState(0);

  return (
    <View className="flex-1 bg-gray-50">
      <CartHeader itemCount={cart.length} />

      <ScrollView className="flex-1">
        <CartItems />
        <CartPromoCode
          onApplyPromo={(discount) => setPromoDiscount(discount)}
        />
        <CartSummary
          subtotal={cartTotal}
          discount={cartDiscount}
          promoDiscount={promoDiscount}
        />
      </ScrollView>

      <CartFooter total={cartTotal - promoDiscount} itemCount={cart.length} />
    </View>
  );
};

export default Cart;

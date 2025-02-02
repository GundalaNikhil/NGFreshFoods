import { useRecoilState, useRecoilValue } from "recoil";
import { cartState } from "../recoil/atoms/cartAtom";
import { promoCodeState } from "../recoil/atoms/discountAtom";
import {
  cartDiscountSelector,
  cartItemsCountSelector,
  cartTotalSelector,
} from "../recoil/selectors/cartSelector";
import { generateCustomProductId } from "../utils/cartHelper";
import { useProducts } from "./useProducts";

export const useCart = () => {
  const [cart, setCart] = useRecoilState(cartState);
  const [promoCode, setPromoCode] = useRecoilState(promoCodeState);
  const cartTotal = useRecoilValue(cartTotalSelector);
  const cartDiscount = useRecoilValue(cartDiscountSelector);
  const itemCount = useRecoilValue(cartItemsCountSelector);
  const { updateStock } = useProducts();

  const addToCart = (product, customizations = null) => {
    const productId = generateCustomProductId(product, customizations);

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          productId,
          ...product,
          customizations,
          quantity: 1,
        },
      ];
    });

    updateStock(product.product_id, 1);
  };

  const removeFromCart = (productId) => {
    const item = cart.find((item) => item.productId === productId);
    if (item) {
      updateStock(item.product_id, -item.quantity);
      setCart((current) =>
        current.filter((item) => item.productId !== productId)
      );
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((current) =>
      current.map((item) => {
        if (item.productId === productId) {
          const quantityDiff = newQuantity - item.quantity;
          updateStock(item.product_id, quantityDiff);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const applyPromoCode = (code, discount) => {
    setPromoCode({ code, discount });
  };

  const clearPromoCode = () => {
    setPromoCode({ code: null, discount: 0 });
  };

  const clearCart = () => {
    cart.forEach((item) => {
      updateStock(item.product_id, -item.quantity);
    });
    setCart([]);
    clearPromoCode();
  };

  return {
    cart,
    cartTotal,
    cartDiscount,
    itemCount,
    promoCode,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyPromoCode,
    clearPromoCode,
    clearCart,
  };
};

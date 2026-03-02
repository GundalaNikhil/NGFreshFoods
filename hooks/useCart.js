import { useRecoilState, useRecoilValue } from "recoil";
import { cartState } from "../recoil/atoms/cartAtom";
import { promoCodeState } from "../recoil/atoms/discountAtom";
import { authAtom } from "../recoil/atoms/authAtom";
import {
  cartDiscountSelector,
  cartItemsCountSelector,
  cartTotalSelector,
} from "../recoil/selectors/cartSelector";
import { generateCustomProductId } from "../utils/cartHelper";
import { useProducts } from "./useProducts";
import { clearCart as clearServerCart } from "../services/bff/cartBff";

export const useCart = () => {
  const [cart, setCart] = useRecoilState(cartState);
  const [promoCode, setPromoCode] = useRecoilState(promoCodeState);
  const authState = useRecoilValue(authAtom);
  const cartTotal = useRecoilValue(cartTotalSelector);
  const cartDiscount = useRecoilValue(cartDiscountSelector);
  const itemCount = useRecoilValue(cartItemsCountSelector);
  const { updateStock } = useProducts();

  const cartItems = cart?.items || [];

  // ── helpers ──

  const bumpVersion = (cartObj) => ({
    ...cartObj,
    _version: (cartObj._version || 0) + 1,
  });

  const calculateCustomPrice = (product, customizations) => {
    if (!customizations) return product.base_price;

    const weightMultipliers = {
      "250gms": 0.25,
      "500gms": 0.5,
      "750gms": 0.75,
      "1kg": 1,
    };

    const weightAdjustedPrice =
      product.base_price * (weightMultipliers[customizations.netWeight] || 0.25);
    const skinExtra = customizations.skinType === "Skinless" ? 100 : 0;
    const flavourExtra =
      customizations.flavour === "Smoked & Turmeric" ? 10 : 0;

    return Number((weightAdjustedPrice + skinExtra + flavourExtra).toFixed(2));
  };

  const generateCustomizationId = (product, customizations) => {
    if (!customizations) return null;
    const customString = `${product.id}_${customizations.netWeight}_${customizations.skinType}_${customizations.flavour}_${customizations.cutSize}`;
    return customString.replace(/\s+/g, "_").toLowerCase();
  };

  // ── cart actions ──

  const addToCart = (product, customizations = null) => {
    const productId = generateCustomProductId(product, customizations);
    const itemPrice = customizations
      ? calculateCustomPrice(product, customizations)
      : product.base_price;
    const customizationId = generateCustomizationId(product, customizations);

    let shouldUpdateStock = false;

    setCart((currentCart) => {
      const currentItems = currentCart?.items || [];
      const existingItem = currentItems.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        shouldUpdateStock = true;
        const updatedItems = currentItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                custQuantity: item.custQuantity + 1,
                quantity: item.quantity + 1,
                totalPrice: itemPrice * (item.quantity + 1),
                custPrice: itemPrice * (item.custQuantity + 1),
              }
            : item
        );
        return bumpVersion({ ...currentCart, items: updatedItems });
      }

      shouldUpdateStock = true;
      const newItem = {
        productId,
        customizationId,
        ...product,
        customizations,
        quantity: 1,
        custQuantity: 1,
        itemPrice,
        custPrice: itemPrice,
        totalPrice: itemPrice,
      };
      return bumpVersion({
        ...currentCart,
        items: [...currentItems, newItem],
      });
    });

    if (product.stock_quantity !== undefined && shouldUpdateStock) {
      updateStock(product.id, 1);
    }
  };

  const removeFromCart = (productId) => {
    const item = cartItems.find((item) => item.productId === productId);
    if (!item) return;

    setCart((current) => {
      const updatedItems = (current?.items || []).filter(
        (i) => i.productId !== productId
      );
      return bumpVersion({ ...current, items: updatedItems });
    });

    if (item.stock_quantity !== undefined) {
      updateStock(item.id, -item.quantity);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    const currentItem = cartItems.find((item) => item.productId === productId);
    if (!currentItem) return;

    const quantityDiff = newQuantity - currentItem.quantity;

    setCart((current) => {
      const updatedItems = (current?.items || []).map((item) => {
        if (item.productId !== productId) return item;
        const price = item.customizations
          ? calculateCustomPrice(item, item.customizations)
          : item.base_price;
        return {
          ...item,
          quantity: newQuantity,
          custQuantity: newQuantity,
          itemPrice: price,
          custPrice: price * newQuantity,
          totalPrice: price * newQuantity,
        };
      });
      return bumpVersion({ ...current, items: updatedItems });
    });

    if (currentItem.stock_quantity !== undefined) {
      updateStock(currentItem.id, quantityDiff);
    }
  };

  // ── coupon / promo ──

  const applyPromoCode = (code, discount) => {
    setPromoCode({ code, discount });
  };

  const clearPromoCode = () => {
    setPromoCode({ code: null, discount: 0 });
  };

  const applyCoupon = (coupon, discountAmount) => {
    setCart((current) =>
      bumpVersion({
        ...current,
        appliedOffer: true,
        promoCode: coupon?.code || coupon?.promoCode || null,
        offer: coupon || null,
        discountAmount: Number(discountAmount || 0),
      })
    );
  };

  const removeCoupon = () => {
    setCart((current) =>
      bumpVersion({
        ...current,
        appliedOffer: false,
        promoCode: null,
        offer: null,
        discountAmount: 0,
      })
    );
  };

  const clearCart = async () => {
    const itemsToUpdateStock = cartItems.filter(
      (item) => item.stock_quantity !== undefined
    );

    setCart(
      bumpVersion({
        items: [],
        appliedOffer: false,
        promoCode: null,
        offer: null,
        discountAmount: 0,
      })
    );

    clearPromoCode();

    itemsToUpdateStock.forEach((item) => {
      updateStock(item.id, -item.quantity);
    });

    if (authState?.isAuthenticated) {
      try {
        await clearServerCart();
      } catch (_error) {
        // ignore server clear errors
      }
    }
  };

  return {
    cart: cartItems,
    cartData: cart,
    cartTotal,
    cartDiscount,
    itemCount,
    promoCode,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyPromoCode,
    clearPromoCode,
    applyCoupon,
    removeCoupon,
    clearCart,
  };
};

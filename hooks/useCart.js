import { useRecoilState, useRecoilValue } from "recoil";
import { cartState } from "../recoil/atoms/cartAtom";
import { promoCodeState } from "../recoil/atoms/discountAtom";
import { authAtom } from "../recoil/atoms/authAtom";
import {
  cartDiscountSelector,
  cartItemsCountSelector,
  cartTotalSelector,
} from "../recoil/selectors/cartSelector";
import { generateCartKey, calculateUnitPrice } from "../utils/cartHelper";
import { getEntityImageUrl } from "../utils/imageUrl";
import { getProductFoodType } from "../utils/productClassification";
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

  const bumpVersion = (cartObj) => ({
    ...cartObj,
    _version: (cartObj._version || 0) + 1,
  });

  // ── cart actions ──

  /**
   * Add a product to cart.
   *
   * @param {Object}  product          – product object from API
   * @param {Object}  selectedVariant  – { variantId, label, price } or null for non-variant products
   * @param {Array}   selectedAddons   – [{ addonId, label, extraPrice, addonGroup }] or []
   */
  const addToCart = (product, selectedVariant = null, selectedAddons = []) => {
    const productId = product.product_id || product.productId || product.id;
    const variantId = selectedVariant?.variantId || null;
    const addonIds = selectedAddons.map((a) => a.addonId);
    const cartKey = generateCartKey(productId, variantId, addonIds);

    const unitPrice = selectedVariant
      ? calculateUnitPrice(Number(selectedVariant.price) || 0, selectedAddons)
      : Number(product.base_price || product.basePrice || product.price || 0);

    console.log("[useCart] addToCart:", {
      productId,
      variantId,
      unitPrice,
      variantPrice: selectedVariant?.price,
      base_price: product.base_price,
      basePrice: product.basePrice,
    });

    setCart((currentCart) => {
      const currentItems = currentCart?.items || [];
      const existingItem = currentItems.find((item) => item.cartKey === cartKey);

      if (existingItem) {
        const newQty = existingItem.quantity + 1;
        const updatedItems = currentItems.map((item) =>
          item.cartKey === cartKey
            ? {
                ...item,
                quantity: newQty,
                lineTotal: Number((unitPrice * newQty).toFixed(2)),
              }
            : item
        );
        return bumpVersion({ ...currentCart, items: updatedItems });
      }

      const newItem = {
        cartKey,
        productId,
        variantId,
        addonIds,
        quantity: 1,
        unitPrice,
        lineTotal: unitPrice,
        // Display metadata
        name: product.name,
        imageUrl: getEntityImageUrl(product),
        foodType: getProductFoodType(product),
        variantLabel: selectedVariant?.label || null,
        addonLabels: selectedAddons.map((a) => a.label),
        addonGroups: selectedAddons.reduce((acc, a) => {
          acc[a.addonGroup] = a.label;
          return acc;
        }, {}),
      };

      return bumpVersion({
        ...currentCart,
        items: [...currentItems, newItem],
      });
    });

    if (product.stock_quantity !== undefined || product.stockQuantity !== undefined) {
      updateStock(product.id || product.productId, 1);
    }
  };

  const removeFromCart = (cartKey) => {
    const item = cartItems.find((item) => item.cartKey === cartKey);
    if (!item) return;

    setCart((current) => {
      const updatedItems = (current?.items || []).filter(
        (i) => i.cartKey !== cartKey
      );
      return bumpVersion({ ...current, items: updatedItems });
    });

    if (item.productId) {
      updateStock(item.productId, -item.quantity);
    }
  };

  const updateQuantity = (cartKey, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartKey);
      return;
    }

    const currentItem = cartItems.find((item) => item.cartKey === cartKey);
    if (!currentItem) return;

    const quantityDiff = newQuantity - currentItem.quantity;

    setCart((current) => {
      const updatedItems = (current?.items || []).map((item) => {
        if (item.cartKey !== cartKey) return item;
        return {
          ...item,
          quantity: newQuantity,
          lineTotal: Number((item.unitPrice * newQuantity).toFixed(2)),
        };
      });
      return bumpVersion({ ...current, items: updatedItems });
    });

    if (currentItem.productId) {
      updateStock(currentItem.productId, quantityDiff);
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
    console.log("[useCart] applyCoupon:", {
      couponCode: coupon?.code || coupon?.promoCode,
      discountAmount,
      currentItemCount: cartItems.length,
    });
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
    console.log("[useCart] removeCoupon, itemCount:", cartItems.length);
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

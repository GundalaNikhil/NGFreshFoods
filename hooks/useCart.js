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
import React from "react";

export const useCart = () => {
  const [cart, setCart] = useRecoilState(cartState);
  const [promoCode, setPromoCode] = useRecoilState(promoCodeState);
  const cartTotal = useRecoilValue(cartTotalSelector);
  const cartDiscount = useRecoilValue(cartDiscountSelector);
  const itemCount = useRecoilValue(cartItemsCountSelector);
  const { updateStock } = useProducts();

  // Ensure cart has the proper structure
  const cartItems = cart?.items || [];

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

    const finalPrice = weightAdjustedPrice + skinExtra + flavourExtra;

    return Number(finalPrice.toFixed(2));
  };

  // Generate unique customization ID
  const generateCustomizationId = (product, customizations) => {
    if (!customizations) return null;

    const customString = `${product.id}_${customizations.netWeight}_${customizations.skinType}_${customizations.flavour}_${customizations.cutSize}`;
    return customString.replace(/\s+/g, "_").toLowerCase();
  };

  const addToCart = (product, customizations = null) => {
    const productId = generateCustomProductId(product, customizations);
    const itemPrice = customizations
      ? calculateCustomPrice(product, customizations)
      : product.base_price;

    const customizationId = generateCustomizationId(product, customizations);

    // Track if we need to update stock
    let shouldUpdateStock = false;

    setCart((currentCart) => {
      // Ensure currentCart has proper structure
      const currentItems = currentCart?.items || [];

      const existingItem = currentItems.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        const updatedItem = {
          ...existingItem,
          custQuantity: existingItem.custQuantity + 1,
          quantity: existingItem.quantity + 1,
          totalPrice: itemPrice * (existingItem.quantity + 1),
          custPrice: itemPrice * (existingItem.custQuantity + 1),
        };

        console.log("Updated existing item:", updatedItem);
        shouldUpdateStock = true;

        const updatedItems = currentItems.map((item) =>
          item.productId === productId ? updatedItem : item
        );

        return {
          ...currentCart,
          items: updatedItems,
        };
      }

      const newItem = {
        productId,
        customizationId,
        ...product,
        customizations,
        quantity: 1,
        custQuantity: 1,
        itemPrice: itemPrice,
        custPrice: itemPrice,
        totalPrice: itemPrice,
      };

      console.log("Added new item:", newItem);
      shouldUpdateStock = true;

      return {
        ...currentCart,
        items: [...currentItems, newItem],
      };
    });

    // Only update stock for products that have stock management - AFTER state update
    if (product.stock_quantity !== undefined && shouldUpdateStock) {
      updateStock(product.id, 1);
    }
  };

  const removeFromCart = (productId) => {
    const item = cartItems.find((item) => item.productId === productId);
    if (item) {
      console.log("Removing item:", item);

      setCart((current) => {
        const currentItems = current?.items || [];
        const updatedItems = currentItems.filter(
          (item) => item.productId !== productId
        );

        return {
          ...current,
          items: updatedItems,
        };
      });

      // Only update stock if the product has stock management - AFTER state update
      if (item.stock_quantity !== undefined) {
        updateStock(item.id, -item.quantity);
      }
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    // Find the item and calculate quantity difference before state update
    const currentItem = cartItems.find((item) => item.productId === productId);
    if (!currentItem) return;

    const quantityDiff = newQuantity - currentItem.quantity;

    setCart((current) => {
      const currentItems = current?.items || [];

      const updatedItems = currentItems.map((item) => {
        if (item.productId === productId) {
          // Recalculate total price based on new quantity
          const itemPrice = item.customizations
            ? calculateCustomPrice(item, item.customizations)
            : item.base_price;

          const updatedItem = {
            ...item,
            quantity: newQuantity,
            custQuantity: newQuantity,
            itemPrice: itemPrice,
            custPrice: itemPrice * newQuantity,
            totalPrice: itemPrice * newQuantity,
          };

          console.log("Updated quantity for item:", updatedItem);
          return updatedItem;
        }
        return item;
      });

      return {
        ...current,
        items: updatedItems,
      };
    });

    // Only update stock if the product has stock management - AFTER state update
    if (currentItem.stock_quantity !== undefined) {
      updateStock(currentItem.id, quantityDiff);
    }
  };

  const applyPromoCode = (code, discount) => {
    setPromoCode({ code, discount });
  };

  const clearPromoCode = () => {
    setPromoCode({ code: null, discount: 0 });
  };

  const applyCoupon = (coupon, discountAmount) => {
    setCart((current) => ({
      ...current,
      appliedOffer: true,
      promoCode: coupon?.code || coupon?.promoCode || null,
      offer: coupon || null,
      discountAmount: Number(discountAmount || 0),
    }));
  };

  const removeCoupon = () => {
    setCart((current) => ({
      ...current,
      appliedOffer: false,
      promoCode: null,
      offer: null,
      discountAmount: 0,
    }));
  };

  const clearCart = () => {
    console.log("Clearing cart. Current cart:", cart);

    // Store items that need stock updates before clearing
    const itemsToUpdateStock = cartItems.filter(
      (item) => item.stock_quantity !== undefined
    );

    setCart({
      items: [],
      appliedOffer: false,
      promoCode: null,
      offer: null,
      discountAmount: 0,
    });

    clearPromoCode();

    // Update stock for all items AFTER state update
    itemsToUpdateStock.forEach((item) => {
      updateStock(item.id, -item.quantity);
    });

    console.log("Cart cleared");
  };

  // Console log current cart state whenever it changes
  React.useEffect(() => {
    console.log("Current Cart State:", cart);
    console.log("Cart Items:", cartItems);
    console.log("Cart Total Items:", itemCount);
    console.log("Cart Total Amount:", cartTotal);

    // Detailed breakdown of each item
    cartItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        productName: item.name,
        productId: item.productId,
        customizationId: item.customizationId,
        customizations: item.customizations,
        quantity: item.quantity,
        custQuantity: item.custQuantity,
        itemPrice: item.itemPrice,
        custPrice: item.custPrice,
        totalPrice: item.totalPrice,
      });
    });
  }, [cart, cartItems, itemCount, cartTotal]);

  return {
    cart: cartItems, // Return items array for backward compatibility
    cartData: cart, // Return full cart object
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

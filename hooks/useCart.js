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

  const calculateCustomPrice = (product, customizations) => {
    if (!customizations) return product.price;

    const weightMultipliers = {
      "250gms": 0.25,
      "500gms": 0.5,
      "750gms": 0.75,
      "1kg": 1,
    };

    const weightAdjustedPrice =
      product.price * (weightMultipliers[customizations.netWeight] || 0.25);
    const skinExtra = customizations.skinType === "Skinless" ? 100 : 0;
    const flavourExtra =
      customizations.flavour === "Smoked & Turmeric" ? 10 : 0;

    const finalPrice = weightAdjustedPrice + skinExtra + flavourExtra;

    return Number(finalPrice.toFixed(2));
  };

  // Generate unique customization ID
  const generateCustomizationId = (product, customizations) => {
    if (!customizations) return null;

    const customString = `${product.product_id}_${customizations.netWeight}_${customizations.skinType}_${customizations.flavour}_${customizations.cutSize}`;
    return customString.replace(/\s+/g, "_").toLowerCase();
  };

  const addToCart = (product, customizations = null) => {
    const productId = generateCustomProductId(product, customizations);
    const itemPrice = customizations
      ? calculateCustomPrice(product, customizations)
      : product.price;

    const customizationId = generateCustomizationId(product, customizations);

    // Track if we need to update stock
    let shouldUpdateStock = false;

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        const updatedItem = {
          ...existingItem,
          custQuantity: existingItem.custQuantity + 1,
          quantity: existingItem.quantity + 1,
          totalPrice: itemPrice * (existingItem.quantity + 1),
          custPrice: itemPrice * (existingItem.custQuantity + 1), // Updated custom price
        };

        // Console log for debugging
        console.log("Updated existing item:", updatedItem);

        // Set flag to update stock after state update
        shouldUpdateStock = true;

        return currentCart.map((item) =>
          item.productId === productId ? updatedItem : item
        );
      }

      const newItem = {
        productId,
        customizationId,
        ...product,
        customizations,
        quantity: 1,
        custQuantity: 1, // Custom quantity
        itemPrice: itemPrice,
        custPrice: itemPrice, // Custom price
        totalPrice: itemPrice,
      };

      // Console log for debugging
      console.log("Added new item:", newItem);

      // Set flag to update stock after state update
      shouldUpdateStock = true;

      return [...currentCart, newItem];
    });

    // Only update stock for products that have stock management - AFTER state update
    if (product.stock_quantity !== undefined && shouldUpdateStock) {
      updateStock(product.product_id, 1);
    }
  };

  const removeFromCart = (productId) => {
    const item = cart.find((item) => item.productId === productId);
    if (item) {
      console.log("Removing item:", item);

      setCart((current) =>
        current.filter((item) => item.productId !== productId)
      );

      // Only update stock if the product has stock management - AFTER state update
      if (item.stock_quantity !== undefined) {
        updateStock(item.product_id, -item.quantity);
      }
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    // Find the item and calculate quantity difference before state update
    const currentItem = cart.find((item) => item.productId === productId);
    if (!currentItem) return;

    const quantityDiff = newQuantity - currentItem.quantity;

    setCart((current) =>
      current.map((item) => {
        if (item.productId === productId) {
          // Recalculate total price based on new quantity
          const itemPrice = item.customizations
            ? calculateCustomPrice(item, item.customizations)
            : item.price;

          const updatedItem = {
            ...item,
            quantity: newQuantity,
            custQuantity: newQuantity, // Update custom quantity as well
            itemPrice: itemPrice,
            custPrice: itemPrice * newQuantity, // Update custom price
            totalPrice: itemPrice * newQuantity,
          };

          console.log("Updated quantity for item:", updatedItem);

          return updatedItem;
        }
        return item;
      })
    );

    // Only update stock if the product has stock management - AFTER state update
    if (currentItem.stock_quantity !== undefined) {
      updateStock(currentItem.product_id, quantityDiff);
    }
  };

  const applyPromoCode = (code, discount) => {
    setPromoCode({ code, discount });
  };

  const clearPromoCode = () => {
    setPromoCode({ code: null, discount: 0 });
  };

  const clearCart = () => {
    console.log("Clearing cart. Current cart:", cart);

    // Store items that need stock updates before clearing
    const itemsToUpdateStock = cart.filter(
      (item) => item.stock_quantity !== undefined
    );

    setCart([]);
    clearPromoCode();

    // Update stock for all items AFTER state update
    itemsToUpdateStock.forEach((item) => {
      updateStock(item.product_id, -item.quantity);
    });

    console.log("Cart cleared");
  };

  // Console log current cart state whenever it changes
  React.useEffect(() => {
    console.log("Current Cart State:", cart);
    console.log("Cart Total Items:", itemCount);
    console.log("Cart Total Amount:", cartTotal);

    // Detailed breakdown of each item
    cart.forEach((item, index) => {
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
  }, [cart, itemCount, cartTotal]);

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

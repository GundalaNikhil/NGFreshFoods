// utils/promoValidation.js

/**
 * Enhanced utility functions for promo code validation
 */

// Check if current day is weekend (Saturday or Sunday)
export const isWeekend = () => {
  const today = new Date().getDay();
  return today === 0 || today === 6; // 0 = Sunday, 6 = Saturday
};

// Calculate total chicken weight in cart
export const calculateChickenWeight = (cartItems) => {
  if (!cartItems) return 0;

  let totalChickenWeight = 0;

  // Handle different cart data structures
  let items = [];
  if (Array.isArray(cartItems)) {
    items = cartItems;
  } else if (typeof cartItems === "object") {
    // Convert cart object to array, filtering valid items
    items = Object.values(cartItems).filter(
      (item) =>
        item &&
        typeof item === "object" &&
        (item.productId || item.id) &&
        item.quantity > 0
    );
  }

  items.forEach((item) => {
    // Multiple ways to identify chicken items
    const isChicken =
      item.category_id?.toLowerCase().includes("chicken") ||
      item.category?.toLowerCase().includes("chicken") ||
      item.categoryName?.toLowerCase().includes("chicken") ||
      item.name?.toLowerCase().includes("chicken") ||
      item.productName?.toLowerCase().includes("chicken") ||
      item.tags?.some((tag) => tag.toLowerCase().includes("chicken")) ||
      item.description?.toLowerCase().includes("chicken") ||
      item.type?.toLowerCase().includes("chicken");

    if (isChicken) {
      const quantity = item.quantity || item.custQuantity || 0;
      let weightPerUnit = 0;

      // First check for netWeight in customizations (like in the example object)
      if (item.customizations?.netWeight) {
        const netWeightStr = item.customizations.netWeight.toLowerCase();
        // Handle different weight formats (gms, kg, etc.)
        const gMatch = netWeightStr.match(/(\d+(?:\.\d+)?)\s*g(?:ms)?/);
        const kgMatch = netWeightStr.match(/(\d+(?:\.\d+)?)\s*kg/);

        if (gMatch) {
          weightPerUnit = parseFloat(gMatch[1]) / 1000; // Convert grams to kg
        } else if (kgMatch) {
          weightPerUnit = parseFloat(kgMatch[1]);
        }
      }

      // If no weight found in customizations, try other fields
      if (weightPerUnit === 0) {
        const weightSources = [
          item.weight,
          item.perQuantity,
          item.unitWeight,
          item.name,
          item.productName,
          item.description,
        ].filter(Boolean);

        for (let source of weightSources) {
          const weightStr = String(source);
          const weightMatch = weightStr.match(/(\d+(?:\.\d+)?)\s*kg/i);
          if (weightMatch) {
            weightPerUnit = parseFloat(weightMatch[1]);
            break;
          }
        }
      }

      // If no weight found in text, check if weight is a direct number
      if (weightPerUnit === 0 && typeof item.weight === "number") {
        weightPerUnit = item.weight;
      }

      totalChickenWeight += weightPerUnit * quantity;
    }
  });

  return Math.round(totalChickenWeight * 100) / 100; // Round to 2 decimal places
};

// Check if user is first time user
export const isFirstTimeUser = (userProfile) => {
  return (
    userProfile?.isFirstTime === true || userProfile?.isFirstTimeUser === true
  );
};

// Get cheapest chicken item for BOGO calculation
const getCheapestChickenItem = (cartItems) => {
  let items = [];
  if (Array.isArray(cartItems)) {
    items = cartItems;
  } else if (typeof cartItems === "object") {
    items = Object.values(cartItems).filter(
      (item) => item && typeof item === "object" && (item.productId || item.id)
    );
  }

  const chickenItems = items.filter((item) => {
    const isChicken =
      item.category_id?.toLowerCase().includes("chicken") ||
      item.category?.toLowerCase().includes("chicken") ||
      item.categoryName?.toLowerCase().includes("chicken") ||
      item.name?.toLowerCase().includes("chicken") ||
      item.productName?.toLowerCase().includes("chicken");
    return isChicken && (item.quantity || item.custQuantity) > 0;
  });

  if (chickenItems.length === 0) return null;

  return chickenItems.reduce((min, item) => {
    const currentPrice = item.price || item.itemPrice || item.totalPrice || 0;
    const minPrice = min.price || min.itemPrice || min.totalPrice || 0;
    return currentPrice < minPrice ? item : min;
  });
};

// Promo code definitions with validation rules
export const PROMO_CODES = {
  WELCOME50: {
    code: "WELCOME50",
    discount: 50,
    type: "fixed",
    title: "Welcome Offer",
    description: "Flat ₹50 off for first-time users",
    minOrder: 0,
    validate: (cartItems, userProfile, cartTotal) => {
      return isFirstTimeUser(userProfile);
    },
    errorMessage: "This offer is only valid for first-time users",
    enabled: (cartItems, userProfile) => isFirstTimeUser(userProfile),
  },

  B1G1FRESH: {
    code: "B1G1FRESH",
    discount: 0, // Will be calculated based on cheapest chicken item
    type: "bogo",
    title: "Buy 1 Get 1 Fresh",
    description: "Buy 1 Get 1 free on chicken items (min 1kg chicken)",
    minOrder: 0,
    validate: (cartItems, userProfile, cartTotal) => {
      const chickenWeight = calculateChickenWeight(cartItems);
      return chickenWeight >= 1;
    },
    errorMessage: "Add at least 1kg of chicken items to use this code",
    calculateDiscount: (cartItems) => {
      const cheapestItem = getCheapestChickenItem(cartItems);
      return cheapestItem
        ? cheapestItem.price ||
            cheapestItem.itemPrice ||
            cheapestItem.totalPrice ||
            0
        : 0;
    },
    enabled: (cartItems, userProfile) => calculateChickenWeight(cartItems) >= 1,
  },

  EGGSTRA4YOU: {
    code: "EGGSTRA4YOU",
    discount: 25,
    type: "fixed",
    title: "Eggstra Special",
    description: "Flat ₹25 off when you buy chicken (min 1kg)",
    minOrder: 0,
    validate: (cartItems, userProfile, cartTotal) => {
      const chickenWeight = calculateChickenWeight(cartItems);
      return chickenWeight >= 1;
    },
    errorMessage: "Add at least 1kg of chicken items to use this code",
    enabled: (cartItems, userProfile) => calculateChickenWeight(cartItems) >= 1,
  },

  DOUBLEDELIGHT: {
    code: "DOUBLEDELIGHT",
    discount: 100,
    type: "fixed",
    title: "Double Delight",
    description: "Flat ₹100 off for chicken lovers (min 2kg chicken)",
    minOrder: 0,
    validate: (cartItems, userProfile, cartTotal) => {
      const chickenWeight = calculateChickenWeight(cartItems);
      return chickenWeight >= 2;
    },
    errorMessage: "Add at least 2kg of chicken items to use this code",
    enabled: (cartItems, userProfile) => calculateChickenWeight(cartItems) >= 2,
  },

  WEEKENDFEAST: {
    code: "WEEKENDFEAST",
    discount: 0.15, // 15% discount
    type: "percentage",
    title: "Weekend Feast",
    description: "15% off on weekend orders (max ₹200)",
    minOrder: 0,
    validate: (cartItems, userProfile, cartTotal) => {
      return isWeekend();
    },
    errorMessage: "This offer is only valid on weekends (Saturday & Sunday)",
    calculateDiscount: (cartItems, cartTotal) => {
      return Math.min(cartTotal * 0.15, 200); // 15% off, max ₹200
    },
    enabled: (cartItems, userProfile) => isWeekend(),
  },
};

// Main validation function
export const validatePromoCode = (
  promoCode,
  cartItems,
  userProfile,
  cartTotal = 0
) => {
  const upperPromoCode = promoCode.toUpperCase();
  const promo = PROMO_CODES[upperPromoCode];

  if (!promo) {
    return {
      isValid: false,
      errorMessage: "Invalid promo code",
      discount: 0,
      promo: null,
    };
  }

  // Check if promo is enabled first
  if (!promo.enabled(cartItems, userProfile)) {
    return {
      isValid: false,
      errorMessage: promo.errorMessage,
      discount: 0,
      promo,
    };
  }

  const isValid = promo.validate(cartItems, userProfile, cartTotal);

  if (!isValid) {
    return {
      isValid: false,
      errorMessage: promo.errorMessage,
      discount: 0,
      promo,
    };
  }

  // Calculate discount
  let discount = 0;
  if (promo.calculateDiscount) {
    discount = promo.calculateDiscount(cartItems, cartTotal);
  } else if (promo.type === "percentage") {
    discount = Math.min(cartTotal * promo.discount, 200); // Default max cap for percentage
  } else {
    discount = promo.discount;
  }

  return {
    isValid: true,
    discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
    promo,
  };
};

// Get available promo codes based on current cart and user
export const getAvailablePromoCodes = (cartItems, userProfile) => {
  const availableCodes = [];

  Object.values(PROMO_CODES).forEach((promo) => {
    if (promo.enabled(cartItems, userProfile)) {
      availableCodes.push(promo);
    }
  });

  // Sort by discount amount (highest first)
  return availableCodes.sort((a, b) => {
    const discountA = a.type === "percentage" ? 200 : a.discount; // Use max for percentage
    const discountB = b.type === "percentage" ? 200 : b.discount;
    return discountB - discountA;
  });
};

// Get enabled offer IDs for filtering OffersModal
export const getEnabledOfferIds = (cartItems, userProfile, offersData = []) => {
  const enabledPromoIds = Object.values(PROMO_CODES)
    .filter((promo) => promo.enabled(cartItems, userProfile))
    .map((promo) => promo.code);

  // Also check regular offers that might have conditions
  const enabledOffers = offersData.filter((offer) => {
    // If offer has a promo code, check if that promo is enabled
    if (offer.promoCode) {
      return enabledPromoIds.includes(offer.promoCode);
    }

    // For other offers, you can add custom validation logic here
    // For now, return all offers that are flagged as active
    return offer.flag === true;
  });

  return enabledOffers.map((offer) => offer.id);
};

// Debug function to log cart analysis
export const debugCartAnalysis = (cartItems, userProfile) => {
  const chickenWeight = calculateChickenWeight(cartItems);
  const weekend = isWeekend();
  const firstTime = isFirstTimeUser(userProfile);

  console.log("=== Cart Analysis ===");
  console.log("Chicken Weight:", chickenWeight, "kg");
  console.log("Is Weekend:", weekend);
  console.log("First Time User:", firstTime);
  console.log(
    "Available Promos:",
    getAvailablePromoCodes(cartItems, userProfile).map((p) => p.code)
  );
  console.log("====================");

  return {
    chickenWeight,
    weekend,
    firstTime,
    availablePromos: getAvailablePromoCodes(cartItems, userProfile),
  };
};

/**
 * Cart key = productId + variantId + sorted addonIds
 * This ensures the same product with different customizations gets separate cart entries.
 */
export const generateCartKey = (productId, variantId = null, addonIds = []) => {
  const base = productId || "";
  const variant = variantId || "default";
  const addons = (addonIds || []).sort().join(",");
  return `${base}_${variant}_${addons}`;
};

/**
 * Calculate unit price from variant price + addon extras.
 * All data comes from the API — no hardcoded multipliers.
 */
export const calculateUnitPrice = (variantPrice, selectedAddons = []) => {
  const addonTotal = selectedAddons.reduce(
    (sum, addon) => sum + (addon.extraPrice || 0),
    0
  );
  return Number((variantPrice + addonTotal).toFixed(2));
};

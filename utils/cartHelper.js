export const generateCustomProductId = (product, customizations) => {
  if (!customizations) return product.product_id;

  const customizationsString = Object.values(customizations).join("_");
  return `${product.product_id}_${customizationsString}`;
};

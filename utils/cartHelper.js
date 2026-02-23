export const generateCustomProductId = (product, customizations) => {
  if (!customizations) return product.id;

  const customizationsString = Object.values(customizations).join("_");
  return `${product.id}_${customizationsString}`;
};

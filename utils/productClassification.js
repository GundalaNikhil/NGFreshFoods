const FOOD_TYPE = {
  ALL: "ALL",
  VEG: "VEG",
  NON_VEG: "NON_VEG",
};

const NON_VEG_CATEGORY_IDS = ["CAT_CHICKEN", "CAT_MUTTON", "CAT_FISH", "CAT_SEAFOOD"];
const VEG_CATEGORY_IDS = ["CAT_DAIRY", "CAT_DAIRY_EGGS", "CAT_VEG", "CAT_VEGETABLES"];

const NON_VEG_KEYWORDS = [
  "chicken",
  "mutton",
  "fish",
  "seafood",
  "prawn",
  "meat",
  "lamb",
  "goat",
  "shrimp",
  "crab",
  "egg",
];

const VEG_KEYWORDS = [
  "dairy",
  "paneer",
  "cheese",
  "milk",
  "butter",
  "curd",
  "vegetable",
  "veg",
];

export const productFoodTypeOptions = FOOD_TYPE;

export const getProductFoodType = (product) => {
  const categoryId = String(product?.category_id || product?.categoryId || "").toUpperCase();
  const categoryName = String(product?.categoryName || product?.category?.name || "").toLowerCase();
  const productName = String(product?.name || "").toLowerCase();
  const description = String(product?.description || "").toLowerCase();
  const combined = `${categoryName} ${productName} ${description}`;

  if (product?.foodType === FOOD_TYPE.VEG || product?.isVeg === true) return FOOD_TYPE.VEG;
  if (product?.foodType === FOOD_TYPE.NON_VEG || product?.isVeg === false) return FOOD_TYPE.NON_VEG;

  if (NON_VEG_CATEGORY_IDS.some((id) => categoryId.includes(id))) {
    return FOOD_TYPE.NON_VEG;
  }

  if (NON_VEG_KEYWORDS.some((keyword) => combined.includes(keyword))) {
    return FOOD_TYPE.NON_VEG;
  }

  if (VEG_CATEGORY_IDS.some((id) => categoryId.includes(id))) {
    return FOOD_TYPE.VEG;
  }

  if (VEG_KEYWORDS.some((keyword) => combined.includes(keyword))) {
    return FOOD_TYPE.VEG;
  }

  return FOOD_TYPE.NON_VEG;
};

export const isVegProduct = (product) => getProductFoodType(product) === FOOD_TYPE.VEG;

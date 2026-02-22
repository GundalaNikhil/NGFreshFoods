import { productsData } from "@/components/data/ProductsData";
import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

const CATEGORY_NAME_MAP = {
  CAT_CHICKEN: "Chicken",
  CAT_DAIRY_EGGS: "Eggs",
  CAT_MUTTON: "Mutton",
};

const defaultCategories = Array.from(
  new Set(productsData.map((product) => product.category_id))
).map((categoryId) => ({
  category_id: categoryId,
  name: CATEGORY_NAME_MAP[categoryId] || categoryId.replace("CAT_", ""),
}));

export const productsState = atom({
  key: "productsState",
  default: productsData,
  ...persistAtom("products"),
});

export const categoriesState = atom({
  key: "categoriesState",
  default: defaultCategories,
  ...persistAtom("categories"),
});

export const selectedCategoryState = atom({
  key: "selectedCategoryState",
  default: "ALL",
});

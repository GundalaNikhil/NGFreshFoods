import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

export const productsState = atom({
  key: "productsState",
  default: [],
  ...persistAtom("products"),
});

export const categoriesState = atom({
  key: "categoriesState",
  default: [],
  ...persistAtom("categories"),
});

export const selectedCategoryState = atom({
  key: "selectedCategoryState",
  default: "ALL",
});

export const selectedFoodTypeState = atom({
  key: "selectedFoodTypeState",
  default: "ALL",
});

export const productsLoadingState = atom({
  key: "productsLoadingState",
  default: false,
});

export const productsErrorState = atom({
  key: "productsErrorState",
  default: false,
});

export const searchQueryState = atom({
  key: "searchQueryState",
  default: "",
});

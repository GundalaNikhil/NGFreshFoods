import { productsData } from "@/components/data/ProductsData";
import { atom } from "recoil";
import { persistAtom } from "./persistAtom";

export const productsState = atom({
  key: "productsState",
  default: productsData,
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

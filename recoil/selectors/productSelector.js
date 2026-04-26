import { selector } from "recoil";
import { getProductFoodType } from "../../utils/productClassification";
import {
  productsState,
  selectedCategoryState,
  selectedFoodTypeState,
  searchQueryState,
} from "../atoms/productsAtom";

export const filteredProductsSelector = selector({
  key: "filteredProducts",
  get: ({ get }) => {
    const products = get(productsState);
    const selectedCategory = get(selectedCategoryState);
    const selectedFoodType = get(selectedFoodTypeState);
    const searchQuery = get(searchQueryState);

    let filtered = products;

    // When searching, search across ALL products (category reset happens in the component)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // When not searching, apply category filter
    if (!searchQuery.trim() && selectedCategory !== "ALL") {
      filtered = filtered.filter(
        (product) => product.category_id === selectedCategory
      );
    }

    if (selectedFoodType !== "ALL") {
      filtered = filtered.filter(
        (product) => getProductFoodType(product) === selectedFoodType
      );
    }

    return filtered;
  },
});

import { selector } from "recoil";
import { productsState, selectedCategoryState, searchQueryState } from "../atoms/productsAtom";

export const filteredProductsSelector = selector({
  key: "filteredProducts",
  get: ({ get }) => {
    const products = get(productsState);
    const selectedCategory = get(selectedCategoryState);
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
      return filtered;
    }

    // When not searching, apply category filter
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(
        (product) => product.category_id === selectedCategory
      );
    }

    return filtered;
  },
});

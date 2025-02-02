import { selector } from "recoil";
import { productsState, selectedCategoryState } from "../atoms/productsAtom";

export const filteredProductsSelector = selector({
  key: "filteredProducts",
  get: ({ get }) => {
    const products = get(productsState);
    const selectedCategory = get(selectedCategoryState);

    if (selectedCategory === "ALL") return products;
    return products.filter(
      (product) => product.category_id === selectedCategory
    );
  },
});

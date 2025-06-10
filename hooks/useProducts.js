import { useRecoilState, useRecoilValue } from "recoil";
import {
  categoriesState,
  productsState,
  selectedCategoryState,
} from "../recoil/atoms/productsAtom";
import { filteredProductsSelector } from "../recoil/selectors/productSelector";

export const useProducts = () => {
  const [products, setProducts] = useRecoilState(productsState);
  const [categories] = useRecoilState(categoriesState);
  const [selectedCategory, setSelectedCategory] = useRecoilState(
    selectedCategoryState
  );
  const filteredProducts = useRecoilValue(filteredProductsSelector);

  const updateProduct = (productId, updates) => {
    setProducts((current) =>
      current.map((product) =>
        product.product_id === productId ? { ...product, ...updates } : product
      )
    );
  };

  const updateStock = (productId, quantity) => {
    setProducts((current) =>
      current.map((product) => {
        if (product.product_id === productId) {
          // Check if product has stock_quantity property and it's a valid number
          if (typeof product.stock_quantity === "number") {
            const newStock = product.stock_quantity - quantity;
            // Ensure stock doesn't go below 0
            return {
              ...product,
              stock_quantity: Math.max(0, newStock),
            };
          }
        }
        return product;
      })
    );
  };

  return {
    products: filteredProducts,
    allProducts: products,
    categories,
    selectedCategory,
    setSelectedCategory,
    updateProduct,
    updateStock,
  };
};

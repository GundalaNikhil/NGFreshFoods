import { useEffect, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { productsData } from "../components/data/ProductsData";
import {
  categoriesState,
  productsState,
  selectedCategoryState,
} from "../recoil/atoms/productsAtom";
import { filteredProductsSelector } from "../recoil/selectors/productSelector";

export const useProducts = () => {
  const [products, setProducts] = useRecoilState(productsState);
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [selectedCategory, setSelectedCategory] = useRecoilState(
    selectedCategoryState
  );
  const filteredProducts = useRecoilValue(filteredProductsSelector);

  const catalogCategories = useMemo(() => {
    const CATEGORY_NAME_MAP = {
      CAT_CHICKEN: "Chicken",
      CAT_DAIRY_EGGS: "Eggs",
      CAT_MUTTON: "Mutton",
    };

    return Array.from(new Set(products.map((p) => p.category_id))).map(
      (categoryId) => ({
        category_id: categoryId,
        name: CATEGORY_NAME_MAP[categoryId] || categoryId.replace("CAT_", ""),
      })
    );
  }, [products]);

  useEffect(() => {
    const persistedProductIds = new Set(products.map((p) => p.product_id));
    const missingProducts = productsData.filter(
      (p) => !persistedProductIds.has(p.product_id)
    );

    if (missingProducts.length > 0) {
      setProducts((current) => [...current, ...missingProducts]);
    }
  }, [products, setProducts]);

  useEffect(() => {
    const currentCategoryIds = new Set(
      categories.map((category) => category.category_id)
    );
    const missingCategories = catalogCategories.filter(
      (category) => !currentCategoryIds.has(category.category_id)
    );

    if (missingCategories.length > 0) {
      setCategories((current) => [...current, ...missingCategories]);
    }
  }, [categories, catalogCategories, setCategories]);

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
    categories: catalogCategories,
    selectedCategory,
    setSelectedCategory,
    updateProduct,
    updateStock,
  };
};

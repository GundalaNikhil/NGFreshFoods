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
    current.map((product) =>
      product.product_id === productId
        ? { ...product, stock_quantity: product.stock_quantity - quantity }
        : product
    )
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

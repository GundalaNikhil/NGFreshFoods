import { useEffect, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { productsData } from "../components/data/ProductsData";
import { getEntityImageUrl } from "../utils/imageUrl";
import {
  categoriesState,
  productsState,
  selectedCategoryState,
} from "../recoil/atoms/productsAtom";
import { filteredProductsSelector } from "../recoil/selectors/productSelector";

const getProductId = (product) => product?.id || product?.product_id;

const normalizeProduct = (product) => {
  const resolvedId = getProductId(product);
  const resolvedImageUrl = getEntityImageUrl(product);

  return {
    ...product,
    id: resolvedId,
    product_id: resolvedId,
    base_price: product?.base_price ?? product?.price ?? 0,
    price: product?.price ?? product?.base_price ?? 0,
    unit: product?.unit ?? product?.perQuantity ?? "",
    perQuantity: product?.perQuantity ?? product?.unit ?? "",
    image_url: resolvedImageUrl,
    image: resolvedImageUrl,
    tags: Array.isArray(product?.tags) ? product.tags : [],
    nutritional_info: product?.nutritional_info || {},
  };
};

export const useProducts = () => {
  const [products, setProducts] = useRecoilState(productsState);
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [selectedCategory, setSelectedCategory] = useRecoilState(
    selectedCategoryState
  );
  const filteredProducts = useRecoilValue(filteredProductsSelector);
  const normalizedProducts = useMemo(
    () => products.map(normalizeProduct),
    [products]
  );
  const normalizedFilteredProducts = useMemo(
    () => filteredProducts.map(normalizeProduct),
    [filteredProducts]
  );

  const catalogCategories = useMemo(() => {
    const CATEGORY_NAME_MAP = {
      CAT_CHICKEN: "Chicken",
      CAT_DAIRY_EGGS: "Eggs",
      CAT_MUTTON: "Mutton",
    };

    return Array.from(new Set(normalizedProducts.map((p) => p.category_id))).map(
      (categoryId) => ({
        category_id: categoryId,
        name: CATEGORY_NAME_MAP[categoryId] || categoryId.replace("CAT_", ""),
      })
    );
  }, [normalizedProducts]);

  useEffect(() => {
    const persistedProductIds = new Set(products.map((p) => getProductId(p)));
    const missingProducts = productsData.filter(
      (p) => !persistedProductIds.has(getProductId(p))
    );

    if (missingProducts.length > 0) {
      setProducts((current) => [...current, ...missingProducts]);
    }
  }, [products, setProducts]);

  useEffect(() => {
    const hasLegacySchema = products.some(
      (product) =>
        (product?.product_id && !product?.id) ||
        (product?.price !== undefined && product?.base_price === undefined) ||
        (product?.perQuantity !== undefined && product?.unit === undefined) ||
        (product?.image !== undefined && product?.image_url === undefined)
    );

    if (hasLegacySchema) {
      setProducts((current) => current.map(normalizeProduct));
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
        getProductId(product) === productId ? { ...product, ...updates } : product
      )
    );
  };

  const updateStock = (productId, quantity) => {
    setProducts((current) =>
      current.map((product) => {
        if (getProductId(product) === productId) {
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
    products: normalizedFilteredProducts,
    allProducts: normalizedProducts,
    categories: catalogCategories,
    selectedCategory,
    setSelectedCategory,
    updateProduct,
    updateStock,
  };
};

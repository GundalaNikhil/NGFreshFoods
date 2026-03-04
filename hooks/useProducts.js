import { useEffect, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { getEntityImageUrl } from "../utils/imageUrl";
import {
  categoriesState,
  productsState,
  selectedCategoryState,
  productsLoadingState,
} from "../recoil/atoms/productsAtom";
import { filteredProductsSelector } from "../recoil/selectors/productSelector";
import { fetchCategories, fetchProducts } from "../services/bff/productsBff";

const getProductId = (product) =>
  product?.id || product?.product_id || product?.productId;

const normalizeProduct = (product) => {
  const resolvedId = getProductId(product);
  const resolvedImageUrl = getEntityImageUrl(product);
  const resolvedCategoryId =
    product?.category_id ||
    product?.categoryId ||
    product?.category?.category_id ||
    product?.category?.categoryId ||
    null;

  return {
    ...product,
    id: resolvedId,
    productId: resolvedId,
    product_id: resolvedId,
    categoryId: resolvedCategoryId,
    category_id: resolvedCategoryId,
    base_price:
      product?.base_price ?? product?.basePrice ?? product?.price ?? 0,
    basePrice:
      product?.basePrice ?? product?.base_price ?? product?.price ?? 0,
    price: product?.price ?? product?.base_price ?? product?.basePrice ?? 0,
    unit: product?.unit ?? product?.perQuantity ?? "",
    perQuantity: product?.perQuantity ?? product?.unit ?? "",
    stock_quantity: product?.stock_quantity ?? product?.stockQuantity ?? 0,
    stockQuantity: product?.stockQuantity ?? product?.stock_quantity ?? 0,
    image_url: resolvedImageUrl,
    imageUrl: resolvedImageUrl,
    image: resolvedImageUrl,
    tags: Array.isArray(product?.tags) ? product.tags : [],
    nutritional_info: product?.nutritional_info || {},
    // Variant/addon data from API (empty for fallback/static data)
    variants: product?.variants || [],
    addons: product?.addons || [],
  };
};

const normalizeCategory = (category) => ({
  ...category,
  category_id: category?.category_id || category?.categoryId || category?.id,
});

const dedupeByCategoryId = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = item?.category_id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

// Module-level flag — shared across ALL hook instances so API is called only once
let _catalogLoaded = false;

export const useProducts = () => {
  const [products, setProducts] = useRecoilState(productsState);
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [selectedCategory, setSelectedCategory] = useRecoilState(
    selectedCategoryState
  );
  const [loading, setLoading] = useRecoilState(productsLoadingState);
  const filteredProducts = useRecoilValue(filteredProductsSelector);
  const normalizedProducts = useMemo(
    () => products.map(normalizeProduct),
    [products]
  );
  const normalizedFilteredProducts = useMemo(
    () => filteredProducts.map(normalizeProduct),
    [filteredProducts]
  );
  const normalizedCategories = useMemo(
    () => dedupeByCategoryId(categories.map(normalizeCategory)),
    [categories]
  );

  useEffect(() => {
    if (_catalogLoaded) return;
    _catalogLoaded = true;

    let isActive = true;

    const loadCatalog = async () => {
      setLoading(true);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ]);

        // if (!isActive) return; // REMOVED: Always commit to global store

        if (Array.isArray(productsResponse)) {
          setProducts(productsResponse);
        }

        if (Array.isArray(categoriesResponse)) {
          const normalized = categoriesResponse.map(normalizeCategory);
          const hasUuid = normalized.some(
            (category) =>
              typeof category.category_id === "string" &&
              category.category_id.includes("-")
          );
          const filtered = hasUuid
            ? normalized.filter(
                (category) => category.category_id?.includes("-")
              )
            : normalized;
          setCategories(dedupeByCategoryId(filtered));
        }
      } catch (error) {
        console.warn("Failed to load catalog from API", error);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();

    return () => {
      isActive = false;
    };
  }, [setProducts, setCategories]);

  const hasNormalizedProducts = useMemo(() => ({ done: false }), []);
  const hasNormalizedCategories = useMemo(() => ({ done: false }), []);

  useEffect(() => {
    if (hasNormalizedProducts.done || products.length === 0) return;
    const hasLegacySchema = products.some(
      (product) =>
        (product?.product_id && !product?.id) ||
        (product?.productId && !product?.id) ||
        (product?.price !== undefined && product?.base_price === undefined) ||
        (product?.perQuantity !== undefined && product?.unit === undefined) ||
        (product?.image !== undefined && product?.image_url === undefined) ||
        (product?.categoryId && !product?.category_id)
    );

    if (hasLegacySchema) {
      setProducts((current) => current.map(normalizeProduct));
    }
    hasNormalizedProducts.done = true;
  }, [products, setProducts]);

  useEffect(() => {
    if (hasNormalizedCategories.done || categories.length === 0) return;
    const hasLegacyCategories = categories.some(
      (category) => !category?.category_id && category?.categoryId
    );

    if (hasLegacyCategories) {
      setCategories((current) => dedupeByCategoryId(current.map(normalizeCategory)));
    }
    hasNormalizedCategories.done = true;
  }, [categories, setCategories]);

  useEffect(() => {
    if (selectedCategory === "ALL") return;
    const categoryIds = new Set(
      normalizedCategories.map((category) => category.category_id)
    );
    if (!categoryIds.has(selectedCategory)) {
      setSelectedCategory("ALL");
    }
  }, [normalizedCategories, selectedCategory, setSelectedCategory]);

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
    categories: normalizedCategories,
    selectedCategory,
    setSelectedCategory,
    loading,
    updateProduct,
    updateStock,
  };
};

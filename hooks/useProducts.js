import { useEffect, useMemo, useRef } from "react";
import { InteractionManager } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import { getEntityImageUrl } from "../utils/imageUrl";
import {
  categoriesState,
  productsState,
  selectedCategoryState,
  productsLoadingState,
  productsErrorState,
  searchQueryState,
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
let _catalogPromise = null;

export const useProducts = () => {
  const [products, setProducts] = useRecoilState(productsState);
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [selectedCategory, setSelectedCategory] = useRecoilState(
    selectedCategoryState
  );
  const [loading, setLoading] = useRecoilState(productsLoadingState);
  const [error, setError] = useRecoilState(productsErrorState);
  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);
  const filteredProducts = useRecoilValue(filteredProductsSelector);
  const hasNormalizedProducts = useRef(false);
  const hasNormalizedCategories = useRef(false);
  const normalizedProducts = useMemo(
    () => (Array.isArray(products) ? products.map(normalizeProduct) : []),
    [products]
  );
  const normalizedFilteredProducts = useMemo(
    () => (Array.isArray(filteredProducts) ? filteredProducts.map(normalizeProduct) : []),
    [filteredProducts]
  );
  const normalizedCategories = useMemo(
    () => (Array.isArray(categories) ? dedupeByCategoryId(categories.map(normalizeCategory)) : []),
    [categories]
  );
  const hasCachedCatalog = products.length > 0 && categories.length > 0;
  const isBootstrapping = loading && !hasCachedCatalog;
  const isRefreshing = loading && hasCachedCatalog;

  useEffect(() => {
    let isActive = true;
    let retryTimer = null;
    let interactionTask = null;

    if (_catalogLoaded && hasCachedCatalog) {
      return () => {
        isActive = false;
      };
    }

    const loadCatalog = async (retryCount = 0) => {
      if (!hasCachedCatalog && isActive) {
        setLoading(true);
      }

      try {
        if (!_catalogPromise) {
          _catalogPromise = Promise.all([fetchProducts(), fetchCategories()]).finally(() => {
            _catalogPromise = null;
          });
        }

        const [productsResponse, categoriesResponse] = await _catalogPromise;

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
        
        // Success!
        setError(false);
        _catalogLoaded = true;
      } catch (err) {
        console.warn(`[useProducts] Load failed (Attempt ${retryCount + 1}):`, err.message);
        setError(true);
        _catalogLoaded = false; // Allow future retries/triggers
        
        // Auto-retry after 5 seconds
        if (retryCount < 3) {
          retryTimer = globalThis.setTimeout(() => {
            if (isActive) loadCatalog(retryCount + 1);
          }, 3000 * Math.pow(2, retryCount)); // Exponential backoff (3s, 6s, 12s)
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    if (!hasCachedCatalog) {
      loadCatalog();
    } else {
      interactionTask = InteractionManager.runAfterInteractions(() => {
        if (isActive) {
          loadCatalog();
        }
      });
    }

    return () => {
      isActive = false;
      if (retryTimer) {
        globalThis.clearTimeout(retryTimer);
      }
      interactionTask?.cancel?.();
    };
  }, [hasCachedCatalog, setLoading, setProducts, setCategories, setError]);

  useEffect(() => {
    if (hasNormalizedProducts.current || products.length === 0) return;
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
    hasNormalizedProducts.current = true;
  }, [products, setProducts]);

  useEffect(() => {
    if (hasNormalizedCategories.current || categories.length === 0) return;
    const hasLegacyCategories = categories.some(
      (category) => !category?.category_id && category?.categoryId
    );

    if (hasLegacyCategories) {
      setCategories((current) => dedupeByCategoryId(current.map(normalizeCategory)));
    }
    hasNormalizedCategories.current = true;
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
    isBootstrapping,
    isRefreshing,
    error,
    updateProduct,
    updateStock,
    searchQuery,
    setSearchQuery,
  };
};

import { Image } from "expo-image";
import { getEntityImageUrl, normalizeImageUrl } from "./imageUrl";

const prefetchedUrls = new Set();

const toImageUrl = (item) =>
  typeof item === "string" ? normalizeImageUrl(item) : getEntityImageUrl(item);

export const getCachedImageSource = (item, fallbackUrl) => {
  const uri = toImageUrl(item) || normalizeImageUrl(fallbackUrl);
  return uri ? { uri } : undefined;
};

export const prefetchImageUrls = async (items = [], options = {}) => {
  const { batchSize = 8, cachePolicy = "memory-disk" } = options;
  const urls = [...new Set(items.map(toImageUrl).filter(Boolean))].filter(
    (url) => !prefetchedUrls.has(url)
  );

  if (urls.length === 0) return true;

  urls.forEach((url) => prefetchedUrls.add(url));

  for (let index = 0; index < urls.length; index += batchSize) {
    const batch = urls.slice(index, index + batchSize);
    try {
      await Image.prefetch(batch, cachePolicy);
    } catch (error) {
      batch.forEach((url) => prefetchedUrls.delete(url));
      console.warn("[imageCache] Failed to prefetch image batch", error?.message || error);
      return false;
    }
  }

  return true;
};

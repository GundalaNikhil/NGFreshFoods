import React from "react";
import { Image } from "expo-image";
import { getCachedImageSource } from "../../utils/imageCache";

const CachedImage = ({
  source,
  fallbackUrl,
  cachePolicy = "memory-disk",
  contentFit = "cover",
  transition = 120,
  style,
  onError,
  ...props
}) => {
  // If source is already a resolved { uri } object or a local require() number,
  // use it directly — don't double-wrap through getCachedImageSource which
  // would lose the product_id lookup and fall back to the placeholder.
  let resolvedSource;
  if (typeof source === "number") {
    // Local require() asset
    resolvedSource = source;
  } else if (source && typeof source === "object" && source.uri) {
    // Already resolved { uri: "..." } — pass straight through
    resolvedSource = source;
  } else {
    // Raw product entity or string URL — resolve via cache
    resolvedSource = getCachedImageSource(source, fallbackUrl);
  }

  return (
    <Image
      {...props}
      source={resolvedSource}
      style={style}
      contentFit={contentFit}
      transition={transition}
      cachePolicy={cachePolicy}
      onError={onError}
    />
  );
};

export default React.memo(CachedImage);

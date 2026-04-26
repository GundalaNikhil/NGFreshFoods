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
  const resolvedSource =
    typeof source === "number" ? source : getCachedImageSource(source, fallbackUrl);

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

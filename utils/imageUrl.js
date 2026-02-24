export const normalizeImageUrl = (url) => {
  if (typeof url !== "string") return undefined;

  const trimmedUrl = url.trim();
  if (
    !trimmedUrl ||
    trimmedUrl.toLowerCase() === "null" ||
    trimmedUrl.toLowerCase() === "undefined"
  ) {
    return undefined;
  }

  const withProtocol = trimmedUrl.startsWith("//")
    ? `https:${trimmedUrl}`
    : trimmedUrl;
  const cloudinarySecureUrl = withProtocol.replace(
    /^http:\/\/res\.cloudinary\.com/i,
    "https://res.cloudinary.com"
  );

  // Keep existing escapes intact and only encode characters that break Cloudinary paths.
  return cloudinarySecureUrl
    .replace(/ /g, "%20")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
};

export const getEntityImageUrl = (entity) =>
  normalizeImageUrl(entity?.image_url || entity?.imageUrl || entity?.image);

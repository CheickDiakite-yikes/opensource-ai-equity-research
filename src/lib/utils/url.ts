
/**
 * Check if a string is a valid URL
 */
export function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if a URL is a valid image URL
 */
export function isValidImageUrl(urlString: string): boolean {
  if (!isValidUrl(urlString)) return false;
  
  // Check if URL ends with common image extensions
  const hasImageExtension = /\.(jpeg|jpg|gif|png|webp)($|\?)/i.test(urlString);
  
  // Also check if URL contains image extensions (might have query params after)
  const containsImageExt = /\.(jpeg|jpg|gif|png|webp)/i.test(urlString);
  
  return hasImageExtension || containsImageExt;
}

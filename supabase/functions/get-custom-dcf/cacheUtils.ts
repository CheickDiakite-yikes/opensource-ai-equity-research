
/**
 * Cache-control headers (per DCF type)
 */
export const getCacheHeaders = (type: string) => {
  let maxAge = 3600; // Default 1 hour cache
  
  // Custom DCF types that use user-defined parameters shouldn't be cached as long
  if (type === 'custom-levered' || type === 'advanced') {
    maxAge = 300; // 5 minutes for custom DCF calculations
  }
  
  return {
    'Cache-Control': `public, max-age=${maxAge}`,
    'Vary': 'Origin, Accept-Encoding',
  };
};


/**
 * Generate cache control headers based on DCF type
 */
export const getCacheHeaders = (type: string) => {
  const cacheHeaders: Record<string, string> = {};
  
  // Different DCF types get different cache timeouts
  switch(type) {
    case 'standard':
    case 'levered':
      // Cache standard DCF for 2 hours
      cacheHeaders['Cache-Control'] = 'public, max-age=7200';
      break;
    case 'custom-levered':
    case 'advanced':
      // Cache custom DCF for 1 hour
      cacheHeaders['Cache-Control'] = 'public, max-age=3600';
      break;
    default:
      // Default cache for 30 minutes
      cacheHeaders['Cache-Control'] = 'public, max-age=1800';
  }
  
  return cacheHeaders;
};

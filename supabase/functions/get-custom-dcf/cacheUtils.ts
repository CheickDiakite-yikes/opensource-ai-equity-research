
/**
 * Get appropriate cache headers for DCF responses
 */
export const getCacheHeaders = (type: string) => {
  // Set different cache durations based on DCF type
  let maxAgeSeconds = 0;
  
  switch (type) {
    case 'standard':
    case 'levered':
      // Cache standard and levered DCF for 6 hours
      maxAgeSeconds = 21600;
      break;
    case 'custom-levered':
    case 'advanced':
      // Cache custom calculations for 1 day
      maxAgeSeconds = 86400;
      break;
    default:
      // Default to 1 hour
      maxAgeSeconds = 3600;
  }
  
  return {
    'Cache-Control': `public, max-age=${maxAgeSeconds}`,
    'Surrogate-Control': `max-age=${maxAgeSeconds}`,
  };
};

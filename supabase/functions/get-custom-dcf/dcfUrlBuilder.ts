
import { API_BASE_URLS, FMP_API_KEY } from "../_shared/constants.ts";

/**
 * Build the DCF API URL based on DCF type and parameters
 */
export const buildDcfApiUrl = (symbol: string, type: string, params: Record<string, string> = {}) => {
  if (!symbol) {
    throw new Error("Symbol is required to build the DCF API URL");
  }
  
  const upperSymbol = symbol.toUpperCase();
  let apiUrl = "";
  
  // Log the DCF type and params for debugging
  console.log(`Building DCF URL for ${upperSymbol}, type: ${type}, params:`, params);
  
  // Determine which FMP endpoint to use based on DCF type
  switch (type) {
    case "standard":
      apiUrl = `${API_BASE_URLS.FMP}/v3/discounted-cash-flow/${upperSymbol}`;
      break;
    case "levered":
      // Update to use the v4 advanced_levered_discounted_cash_flow endpoint
      apiUrl = `${API_BASE_URLS.FMP}/v4/advanced_levered_discounted_cash_flow?symbol=${upperSymbol}`;
      break;
    case "custom-levered":
      apiUrl = `${API_BASE_URLS.FMP}/v4/advanced_levered_discounted_cash_flow?symbol=${upperSymbol}`;
      break;
    case "advanced":
    default:
      apiUrl = `${API_BASE_URLS.FMP}/v4/advanced_discounted_cash_flow?symbol=${upperSymbol}`;
      break;
  }
  
  // Add custom parameters for API endpoints
  if (params && Object.keys(params).length > 0) {
    console.log(`Adding ${Object.keys(params).length} custom parameters to DCF URL`);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'symbol' && key !== 'type') {
        apiUrl += `&${key}=${encodeURIComponent(value)}`;
      }
    });
  }
  
  // Add the API key
  if (apiUrl.includes('?')) {
    apiUrl += `&apikey=${FMP_API_KEY}`;
  } else {
    apiUrl += `?apikey=${FMP_API_KEY}`;
  }
  
  // Log the final URL (with API key hidden)
  console.log(`Final DCF API URL: ${apiUrl.replace(/apikey=[^&]+/, 'apikey=***')}`);
  
  return apiUrl;
};

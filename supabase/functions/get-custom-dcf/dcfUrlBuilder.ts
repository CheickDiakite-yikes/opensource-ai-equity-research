
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
  
  // Determine which FMP endpoint to use based on DCF type
  switch (type) {
    case "standard":
      apiUrl = `${API_BASE_URLS.FMP}/discounted-cash-flow/${upperSymbol}`;
      break;
    case "levered":
      // Update to use v4 advanced levered endpoint as shown in documentation
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
  
  // Add custom parameters for custom DCF endpoints
  if ((type === "advanced" || type === "levered" || type === "custom-levered") && params) {
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
  
  console.log(`Built DCF API URL: ${apiUrl.replace(/apikey=[^&]+/, 'apikey=API_KEY_HIDDEN')}`);
  
  return apiUrl;
};

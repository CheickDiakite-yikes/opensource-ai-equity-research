
import { API_BASE_URLS, FMP_API_KEY } from "../_shared/constants.ts";

/**
 * Build the DCF API URL based on DCF type and parameters
 */
export const buildDcfApiUrl = (symbol: string, type: string, params: Record<string, string> = {}) => {
  if (!symbol || symbol.trim() === "") {
    throw new Error("Symbol is required to build the DCF API URL");
  }
  
  const upperSymbol = symbol.toUpperCase().trim();
  let apiUrl = "";
  
  console.log(`Building DCF API URL for symbol: ${upperSymbol}, type: ${type}`);
  
  // Determine which FMP endpoint to use based on DCF type
  switch (type) {
    case "standard":
      apiUrl = `${API_BASE_URLS.FMP}/v3/discounted-cash-flow/${upperSymbol}`;
      break;
    case "levered":
      apiUrl = `${API_BASE_URLS.FMP}/v4/advanced_levered_discounted_cash_flow?symbol=${upperSymbol}`;
      break;
    case "custom-levered":
      apiUrl = `${API_BASE_URLS.FMP}/v4/advanced_levered_discounted_cash_flow?symbol=${upperSymbol}&type=levered`;
      break;
    case "advanced":
    default:
      apiUrl = `${API_BASE_URLS.FMP}/v4/advanced_discounted_cash_flow?symbol=${upperSymbol}`;
      break;
  }
  
  // Add custom parameters for advanced endpoints
  if ((type === "advanced" || type === "levered" || type === "custom-levered") && params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'symbol' && key !== 'type') {
        apiUrl += `&${key}=${encodeURIComponent(value)}`;
      }
    });
  }
  
  // Add the API key
  apiUrl += (apiUrl.includes('?') ? '&' : '?') + `apikey=${FMP_API_KEY}`;
  
  console.log(`Built DCF API URL for ${type} calculation:`, apiUrl.replace(/apikey=[^&]+/, 'apikey=***'));
  
  return apiUrl;
};

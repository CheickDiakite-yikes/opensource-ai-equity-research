
import { API_BASE_URLS, FMP_API_KEY } from "../_shared/constants.ts";

/**
 * Build the DCF API URL based on DCF type and parameters
 */
export const buildDcfApiUrl = (symbol: string, type: string, params: Record<string, string> = {}) => {
  // Make sure symbol exists and is uppercase
  if (!symbol) {
    throw new Error("Symbol is required to build the DCF API URL");
  }
  
  const upperSymbol = symbol.toUpperCase();
  
  // Determine which FMP endpoint to use based on DCF type
  let apiUrl = "";
  
  switch (type) {
    case "standard":
      // Standard DCF endpoint
      apiUrl = `${API_BASE_URLS.FMP}/v3/discounted-cash-flow/${upperSymbol}`;
      break;
    case "levered":
      // Levered DCF endpoint
      apiUrl = `${API_BASE_URLS.FMP}/v3/levered-discounted-cash-flow/${upperSymbol}`;
      break;
    case "custom-levered":
      // Custom Levered DCF endpoint - using the stable endpoint
      apiUrl = `${API_BASE_URLS.FMP_STABLE}/custom-levered-discounted-cash-flow?symbol=${upperSymbol}`;
      break;
    case "advanced":
    default:
      // Custom DCF Advanced endpoint - using the stable endpoint
      apiUrl = `${API_BASE_URLS.FMP_STABLE}/custom-discounted-cash-flow?symbol=${upperSymbol}`;
      break;
  }
  
  console.log(`Building DCF URL for type: ${type}, symbol: ${upperSymbol}, base URL: ${apiUrl}`);
  
  // Add all provided parameters to query string for custom endpoints
  if ((type === "advanced" || type === "custom-levered") && params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'symbol') {
        // Convert percentage values to decimals if needed
        if (['longTermGrowthRate', 'costOfEquity', 'costOfDebt', 'marketRiskPremium', 'riskFreeRate'].includes(key)) {
          if (typeof value === 'string' && !isNaN(parseFloat(value)) && parseFloat(value) > 0.2) {
            value = (parseFloat(value) / 100).toString();
          }
        }
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
  
  return apiUrl;
};

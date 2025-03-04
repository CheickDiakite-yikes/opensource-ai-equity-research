
/**
 * API Keys
 */
export const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

/**
 * Common constants for API URLs
 */
export const API_BASE_URLS = {
  FMP: "https://financialmodelingprep.com/api/v3",
  FMP_STABLE: "https://financialmodelingprep.com/stable"
}

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  PROFILE_NOT_FOUND: (symbol: string) => `No profile data found for ${symbol}`,
  QUOTE_NOT_FOUND: (symbol: string) => `No quote data found for ${symbol}`,
  API_REQUEST_FAILED: (endpoint: string, symbol: string) => `Unable to fetch ${endpoint} data for ${symbol}`
}

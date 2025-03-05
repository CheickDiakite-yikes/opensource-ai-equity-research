
/**
 * API Keys
 */
export const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";
export const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

/**
 * Common constants for API URLs
 */
export const API_BASE_URLS = {
  FMP: "https://financialmodelingprep.com/api/v3",
  FMP_STABLE: "https://financialmodelingprep.com/stable",
  OPENAI: "https://api.openai.com/v1"
}

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  PROFILE_NOT_FOUND: (symbol: string) => `No profile data found for ${symbol}`,
  QUOTE_NOT_FOUND: (symbol: string) => `No quote data found for ${symbol}`,
  API_REQUEST_FAILED: (endpoint: string, symbol: string) => `Unable to fetch ${endpoint} data for ${symbol}`,
  INDEX_NOT_FOUND: (symbol: string) => `No index data found for ${symbol}`,
  OPENAI_ERROR: (message: string) => `OpenAI API error: ${message}`
}

/**
 * Stock Index Constants
 */
export const STOCK_INDICES = {
  SP500: "^GSPC",
  DOW: "^DJI",
  NASDAQ: "^IXIC",
  RUSSELL: "^RUT",
  VIX: "^VIX",
  FTSE: "^FTSE",
  DAX: "^GDAXI"
}

/**
 * OpenAI Models
 */
export const OPENAI_MODELS = {
  DEFAULT: "gpt-4o-mini",  // Faster, more cost-effective model
  PREMIUM: "gpt-4o",       // More powerful when needed
}

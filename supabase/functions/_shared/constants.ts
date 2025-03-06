
// API keys (will be pulled from environment variables)
export const FMP_API_KEY = Deno.env.get("FMP_API_KEY");

// Base URLs for external APIs
export const API_BASE_URLS = {
  FMP: "https://financialmodelingprep.com/api/v3",
  FMP_STABLE: "https://financialmodelingprep.com/stable"
};


// Environment variables for API Keys
export const FMP_API_KEY = Deno.env.get('FMP_API_KEY') || '';
export const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
export const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY') || '';

// Base URLs for APIs
export const API_BASE_URLS = {
  FMP: 'https://financialmodelingprep.com/api',
  FMP_STABLE: 'https://financialmodelingprep.com/api/stable',
  FINNHUB: 'https://finnhub.io/api/v1',
};

// Constants for cache durations
export const CACHE_DURATIONS = {
  SHORT: 60 * 5, // 5 minutes
  MEDIUM: 60 * 60, // 1 hour 
  LONG: 60 * 60 * 24, // 24 hours
  VERY_LONG: 60 * 60 * 24 * 7, // 7 days
};


import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/fetch-utils.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

/**
 * Fetch company profile data
 */
export async function fetchProfile(symbol: string) {
  const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error (${response.status}): Unable to fetch profile data for ${symbol}`);
  }
  
  const data = await response.json();
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error(`No profile data found for ${symbol}`);
  }
  
  return data;
}

/**
 * Fetch company quote data
 */
export async function fetchQuote(symbol: string) {
  const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`;
  console.log(`Fetching quote from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error (${response.status}): Unable to fetch quote data for ${symbol}`);
  }
  
  const data = await response.json();
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error(`No quote data found for ${symbol}`);
  }
  
  return data;
}

/**
 * Fetch company rating data
 */
export async function fetchRating(symbol: string) {
  const url = `https://financialmodelingprep.com/api/v3/stock_rating/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.warn(`Rating data fetch failed with status ${response.status}`);
    return [{ rating: "N/A" }];
  }
  
  const data = await response.json();
  return data.length > 0 ? data : [{ rating: "N/A" }];
}

/**
 * Create placeholder profile data when API calls fail
 */
export function createPlaceholderProfile(symbol: string) {
  return [{
    symbol,
    companyName: `${symbol} (Data Unavailable)`,
    price: 0,
    exchange: "Unknown",
    industry: "Unknown",
    sector: "Unknown",
    description: `We couldn't retrieve company data for ${symbol}. Please try again later or check if this symbol is valid.`,
    error: "Data unavailable after multiple attempts"
  }];
}

/**
 * Create placeholder quote data when API calls fail
 */
export function createPlaceholderQuote(symbol: string) {
  return [{
    symbol,
    name: `${symbol} (Data Unavailable)`,
    price: 0,
    change: 0,
    changesPercentage: 0,
    error: "Data unavailable after multiple attempts"
  }];
}


import { fetchWithRetry } from "../../_shared/fetch-utils.ts";

// API key from environment variable
const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

// Base URL for FMP API
const FMP_BASE_URL = "https://financialmodelingprep.com/api";

// Fetch company profile as a fallback
export async function fetchCompanyProfile(symbol: string) {
  const url = `${FMP_BASE_URL}/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetchWithRetry(url);
  const data = await response.json();
  
  if (!data || !data.length) {
    throw new Error(`No profile data found for ${symbol}`);
  }
  
  return data[0];
}

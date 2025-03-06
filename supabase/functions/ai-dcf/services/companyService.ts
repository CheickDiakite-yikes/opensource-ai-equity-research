
import { fetchWithRetry } from "../../_shared/fetch-utils.ts";

// API key from environment variable
const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

// Base URL for FMP API
const FMP_BASE_URL = "https://financialmodelingprep.com/api";

// Fetch company profile as a fallback
export async function fetchCompanyProfile(symbol: string) {
  try {
    const url = `${FMP_BASE_URL}/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
    const response = await fetchWithRetry(url);
    const data = await response.json();
    
    if (!data || !data.length) {
      console.error(`No profile data found for ${symbol}`);
      // Return a basic default profile instead of throwing
      return {
        symbol: symbol,
        companyName: symbol,
        price: 100,
        beta: 1.2,
        volAvg: 1000000,
        mktCap: 10000000000,
        lastDiv: 0,
        exchange: "Unknown",
        industry: "Unknown",
        sector: "Unknown"
      };
    }
    
    return data[0];
  } catch (error) {
    console.error(`Error fetching company profile for ${symbol}:`, error);
    // Return a basic default profile
    return {
      symbol: symbol,
      companyName: symbol,
      price: 100,
      beta: 1.2,
      volAvg: 1000000,
      mktCap: 10000000000,
      lastDiv: 0,
      exchange: "Unknown",
      industry: "Unknown",
      sector: "Unknown"
    };
  }
}

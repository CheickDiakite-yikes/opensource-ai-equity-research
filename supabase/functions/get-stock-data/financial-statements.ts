
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/fetch-utils.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

/**
 * Fetch financial statements with a common approach
 */
export async function fetchFinancials(symbol: string, type: string, isBalanceSheet = false) {
  // For balance sheets, try alternative endpoints if the main one fails
  if (isBalanceSheet) {
    try {
      return await fetchBalanceSheetWithFallbacks(symbol);
    } catch (error) {
      console.error(`All balance sheet fetch attempts failed for ${symbol}:`, error);
      // Return empty array instead of throwing
      return [];
    }
  }
  
  // For other financial statements, use standard endpoint
  const url = `https://financialmodelingprep.com/api/v3/${type}/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
  console.log(`Fetching ${type} from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error(`API error (${response.status}): Unable to fetch ${type} data for ${symbol}`);
    // Return empty array instead of throwing
    return [];
  }
  
  const data = await response.json();
  if (!data || !Array.isArray(data)) {
    console.error(`No ${type} data found for ${symbol}`);
    return [];
  }
  
  return data;
}

/**
 * Try multiple balance sheet endpoints with fallbacks
 */
export async function fetchBalanceSheetWithFallbacks(symbol: string) {
  // Try all possible balance sheet endpoints
  const endpoints = [
    `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`,
    `https://financialmodelingprep.com/api/v3/balance-sheet/${symbol}?limit=5&apikey=${FMP_API_KEY}`,
    `https://financialmodelingprep.com/api/v3/financials/balance-sheet-statement/${symbol}?apikey=${FMP_API_KEY}`,
    `https://financialmodelingprep.com/api/v3/balance-sheet-statement-as-reported/${symbol}?limit=5&apikey=${FMP_API_KEY}`
  ];
  
  let lastError = null;
  console.log(`Trying multiple balance sheet endpoints for ${symbol}`);
  
  // Try each endpoint in sequence
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying balance sheet endpoint: ${endpoint.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          console.log(`Successfully fetched balance sheet from endpoint: ${endpoint.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
          return data;
        }
      }
      
      console.log(`Endpoint ${endpoint.replace(FMP_API_KEY, "API_KEY_HIDDEN")} failed, trying next...`);
    } catch (error) {
      console.error(`Error fetching from ${endpoint.replace(FMP_API_KEY, "API_KEY_HIDDEN")}:`, error);
      lastError = error;
    }
  }

  console.warn(`All balance sheet endpoints failed for ${symbol}, returning empty array`);
  return [];
}

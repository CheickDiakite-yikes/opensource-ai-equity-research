
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/fetch-utils.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

/**
 * Fetch historical price data
 */
export async function fetchHistoricalPrice(symbol: string) {
  const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error (${response.status}): Unable to fetch historical price data for ${symbol}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Fetch company news
 */
export async function fetchNews(symbol: string) {
  const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=10&apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.warn(`News data fetch failed with status ${response.status}`);
    return [];
  }
  
  const data = await response.json();
  return data;
}

/**
 * Fetch company peers
 */
export async function fetchPeers(symbol: string) {
  const url = `https://financialmodelingprep.com/api/v3/stock-peers?symbol=${symbol}&apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.warn(`Peers data fetch failed with status ${response.status}`);
    return [{ peersList: [] }];
  }
  
  const data = await response.json();
  return data.length > 0 ? data : [{ peersList: [] }];
}

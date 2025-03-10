
import { FINNHUB_API_KEY, FINNHUB_API_BASE, fetchFromFinnhub } from "./finnhub-utils.ts";

/**
 * Fetch recommendation trends for a company
 */
export async function fetchRecommendationTrends(symbol: string) {
  try {
    const url = `${FINNHUB_API_BASE}/stock/recommendation?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    return await fetchFromFinnhub(url);
  } catch (error) {
    console.error(`Error fetching recommendation trends for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch company news from Finnhub
 */
export async function fetchFinnhubCompanyNews(symbol: string, from: string, to: string) {
  try {
    const url = `${FINNHUB_API_BASE}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    return await fetchFromFinnhub(url);
  } catch (error) {
    console.error(`Error fetching Finnhub company news for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch company peers from Finnhub
 */
export async function fetchFinnhubPeers(symbol: string) {
  try {
    const url = `${FINNHUB_API_BASE}/stock/peers?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    return await fetchFromFinnhub(url);
  } catch (error) {
    console.error(`Error fetching Finnhub peers for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch earnings calendar from Finnhub
 */
export async function fetchEarningsCalendar(from: string, to: string, symbol?: string) {
  try {
    let url = `${FINNHUB_API_BASE}/calendar/earnings?from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    if (symbol) {
      url += `&symbol=${symbol}`;
    }
    return await fetchFromFinnhub(url);
  } catch (error) {
    console.error(`Error fetching earnings calendar:`, error);
    return { earningsCalendar: [] };
  }
}

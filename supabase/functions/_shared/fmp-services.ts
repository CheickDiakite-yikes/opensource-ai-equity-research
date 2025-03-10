
import { FMP_API_KEY } from "./constants.ts";
import { fetchWithRetry } from "./fetch-utils.ts";

/**
 * Fetch enterprise value from FMP
 */
export async function fetchEnterpriseValue(symbol: string, period: string = 'annual', limit: number = 1) {
  try {
    const url = `https://financialmodelingprep.com/api/v3/enterprise-values/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`;
    const response = await fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`API error (${response.status}): Unable to fetch enterprise value for ${symbol}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching enterprise value for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch analyst estimates from FMP
 */
export async function fetchAnalystEstimates(symbol: string, period: string = 'annual', limit: number = 5) {
  try {
    const url = `https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`;
    const response = await fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`API error (${response.status}): Unable to fetch analyst estimates for ${symbol}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching analyst estimates for ${symbol}:`, error);
    return [];
  }
}

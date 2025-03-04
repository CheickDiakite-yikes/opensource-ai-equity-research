
import { fetchWithRetry } from "../../../_shared/fetch-utils.ts";
import { buildFmpUrl, logApiRequest } from "../../../_shared/api-utils.ts";

/**
 * Base controller for financial data endpoints with shared functionality
 */
export class BaseFinancialController {
  /**
   * Create placeholder financial statement data when API calls fail
   */
  createPlaceholderFinancialData(symbol: string, type: string): any[] {
    console.warn(`Creating placeholder ${type} data for ${symbol}`);
    return [];
  }
  
  /**
   * Common error handling for financial endpoints
   */
  handleApiError(error: Error, endpoint: string, symbol: string): any[] {
    console.error(`Error fetching ${endpoint} for ${symbol}:`, error);
    return [];
  }
  
  /**
   * Common fetch implementation with error handling
   */
  async fetchWithErrorHandling<T>(
    url: string, 
    endpoint: string, 
    symbol: string, 
    placeholderFn?: () => T
  ): Promise<T> {
    try {
      logApiRequest(url, endpoint, symbol);
      
      const response = await fetchWithRetry(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch ${endpoint} for ${symbol}`);
        return placeholderFn ? placeholderFn() : [] as unknown as T;
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No ${endpoint} data found for ${symbol}`);
        return placeholderFn ? placeholderFn() : [] as unknown as T;
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return placeholderFn ? placeholderFn() : [] as unknown as T;
    }
  }
}

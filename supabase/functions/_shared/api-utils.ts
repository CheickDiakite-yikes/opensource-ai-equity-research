
import { fetchWithRetry } from "./fetch-utils.ts";
import { corsHeaders } from "./cors.ts";
import { FMP_API_KEY, API_BASE_URLS } from "./constants.ts";

/**
 * Base function for making API requests with proper error handling
 */
export async function makeApiRequest<T>(
  url: string, 
  errorMessage: string = "API request failed"
): Promise<T> {
  try {
    // Use fetchWithRetry for better reliability
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, 3, 1000);
    
    if (!response.ok) {
      throw new Error(`API error (${response.status}): ${errorMessage}`);
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Error making API request: ${url.replace(FMP_API_KEY || "", "API_KEY_HIDDEN")}`, error);
    throw error;
  }
}

/**
 * Build FMP API URL with proper formatting
 */
export function buildFmpUrl(endpoint: string, symbol: string, additionalParams: Record<string, string | number> = {}): string {
  // Start with the base URL and endpoint
  let url = `${API_BASE_URLS.FMP}/${endpoint}/${symbol}?`;
  
  // Add additional parameters
  Object.entries(additionalParams).forEach(([key, value]) => {
    url += `${key}=${value}&`;
  });
  
  // Add the API key
  url += `apikey=${FMP_API_KEY}`;
  
  return url;
}

/**
 * Build FMP API URL for endpoints that use symbol as a query parameter
 */
export function buildFmpQueryUrl(endpoint: string, symbol: string, additionalParams: Record<string, string | number> = {}): string {
  // Start with the base URL and endpoint
  let url = `${API_BASE_URLS.FMP}/${endpoint}?symbol=${symbol}&`;
  
  // Add additional parameters
  Object.entries(additionalParams).forEach(([key, value]) => {
    url += `${key}=${value}&`;
  });
  
  // Add the API key
  url += `apikey=${FMP_API_KEY}`;
  
  return url;
}

/**
 * Build FMP stable API URL with proper formatting
 */
export function buildFmpStableUrl(endpoint: string, symbol: string, additionalParams: Record<string, string | number> = {}): string {
  // Start with the base URL and endpoint
  let url = `${API_BASE_URLS.FMP_STABLE}/${endpoint}?symbol=${symbol}&`;
  
  // Add additional parameters
  Object.entries(additionalParams).forEach(([key, value]) => {
    url += `${key}=${value}&`;
  });
  
  // Add the API key
  url += `apikey=${FMP_API_KEY}`;
  
  return url;
}

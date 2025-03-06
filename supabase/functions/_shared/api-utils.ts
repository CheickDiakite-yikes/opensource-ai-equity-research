
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
    console.error(`Error making API request: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`, error);
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
 * Handle API response with proper error checking
 */
export function handleApiResponse<T>(data: T, errorMessage: string = "No data found"): T {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error(errorMessage);
  }
  return data;
}

/**
 * Create a standard response with CORS headers
 */
export function createResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    { 
      status,
      headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders 
      } 
    }
  );
}

/**
 * Create an error response with CORS headers
 */
export function createErrorResponse(error: Error, status: number = 500): Response {
  return new Response(
    JSON.stringify({ 
      error: error.message || "An unknown error occurred"
    }),
    { 
      status,
      headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders 
      } 
    }
  );
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return fallback;
  }
}

/**
 * Create a placeholder response for when data is not available
 */
export function createPlaceholderResponse(symbol: string, type: string): any[] {
  switch (type) {
    case 'profile':
      return [{
        symbol,
        companyName: `${symbol} (Data Unavailable)`,
        price: 0,
        exchange: "Unknown",
        industry: "Unknown",
        sector: "Unknown",
        description: `We couldn't retrieve company data for ${symbol}. Please try again later or check if this symbol is valid.`,
        error: "Data unavailable"
      }];
    case 'quote':
      return [{
        symbol,
        name: `${symbol} (Data Unavailable)`,
        price: 0,
        change: 0,
        changesPercentage: 0,
        error: "Data unavailable"
      }];
    case 'rating':
      return [{ rating: "N/A" }];
    case 'peers':
      return [{ symbol, peers: [] }];
    default:
      return [];
  }
}

/**
 * Log API request with hidden API key
 */
export function logApiRequest(url: string, endpoint: string, symbol: string): void {
  console.log(`Fetching ${endpoint} data for ${symbol} from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
}

/**
 * Safely access nested object properties
 */
export function getNestedValue<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const value = path.split('.').reduce((o, i) => o[i], obj);
    return value !== undefined ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}


import { fetchWithRetry } from "./fetch-utils.ts";
import { corsHeaders } from "./cors.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

/**
 * Base function for making API requests with proper error handling
 */
export async function makeApiRequest<T>(
  url: string, 
  errorMessage: string = "API request failed"
): Promise<T> {
  try {
    const response = await fetch(url);
    
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
export function buildFmpUrl(endpoint: string, symbol: string, limit: number = 5): string {
  return `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?limit=${limit}&apikey=${FMP_API_KEY}`;
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

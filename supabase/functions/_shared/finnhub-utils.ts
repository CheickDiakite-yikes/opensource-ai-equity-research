
import { corsHeaders } from "./cors.ts";

// Finnhub API base URL
export const FINNHUB_API_BASE = "https://finnhub.io/api/v1";

// Get Finnhub API key from environment
export const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY") || "";

// Create standard CORS headers for response
export function createCorsResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
      status
    }
  );
}

// Create CORS error response
export function createCorsErrorResponse(error: string, status: number = 500): Response {
  return createCorsResponse({ error }, status);
}

// Log Finnhub API call (safely)
export function logFinnhubApiCall(url: string): void {
  // Hide API key in logs
  const logUrl = url.replace(/token=[^&]+/, "token=API_KEY_HIDDEN");
  console.log(`Calling Finnhub API: ${logUrl}`);
}

// Fetch data from Finnhub with retries
export async function fetchFromFinnhub<T>(
  url: string, 
  maxRetries: number = 3
): Promise<T> {
  logFinnhubApiCall(url);
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "5";
        const waitTime = parseInt(retryAfter, 10) * 1000;
        console.warn(`Rate limit hit (attempt ${attempt}/${maxRetries}). Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`Finnhub API error (${response.status}): ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`Error fetching from Finnhub (attempt ${attempt}/${maxRetries}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const waitTime = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error("Failed to fetch from Finnhub after multiple attempts");
}

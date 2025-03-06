
// DCF API utilities
import { withRetry } from "@/services/api/base";

/**
 * Fetch DCF calculation from FMP API
 */
export const fetchDCF = async (url: string): Promise<any> => {
  try {
    // Use withRetry for better resilience
    const response = await withRetry(async () => {
      console.log(`Fetching DCF data from: ${url}`);
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`API returned status ${res.status}: ${await res.text()}`);
      }
      return res;
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching DCF:", error);
    throw error;
  }
};

/**
 * Get DCF calculation from FMP
 */
export const getDCF = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const params = url.searchParams;
  
  // Extract symbol from parameters (required)
  const symbol = params.get("symbol");
  if (!symbol) {
    return new Response(
      JSON.stringify({ error: "Symbol parameter is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  
  // Construct FMP API URL
  const FMP_API_KEY = import.meta.env.VITE_FMP_API_KEY;
  if (!FMP_API_KEY) {
    return new Response(
      JSON.stringify({ error: "API key not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  
  try {
    let fmpEndpoint;
    
    // Extract type parameter with default "advanced"
    const type = params.get("type") || "advanced";
    
    // Choose endpoint based on type
    switch (type) {
      case "levered":
        fmpEndpoint = `https://financialmodelingprep.com/api/v3/levered-discounted-cash-flow/${symbol}?apikey=${FMP_API_KEY}`;
        break;
      case "standard":
        fmpEndpoint = `https://financialmodelingprep.com/api/v3/discounted-cash-flow/${symbol}?apikey=${FMP_API_KEY}`;
        break;
      case "custom-levered":
        fmpEndpoint = `https://financialmodelingprep.com/stable/custom-levered-discounted-cash-flow?symbol=${symbol}&apikey=${FMP_API_KEY}`;
        break;
      case "advanced":
      default:
        fmpEndpoint = `https://financialmodelingprep.com/stable/custom-discounted-cash-flow?symbol=${symbol}&apikey=${FMP_API_KEY}`;
        break;
    }
    
    // Add other parameters if provided
    url.searchParams.forEach((value, key) => {
      if (key !== "symbol" && key !== "type") {
        fmpEndpoint += `&${key}=${value}`;
      }
    });
    
    // Make the API request
    const data = await fetchDCF(fmpEndpoint);
    
    // Return data as JSON
    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in DCF API:", error);
    
    // Return error as JSON
    return new Response(
      JSON.stringify({ 
        error: "Failed to calculate DCF", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

/**
 * Handle DCF API requests
 */
export const onRequest: PagesFunction = async (context) => {
  const req = context.request;
  
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
      },
    });
  }
  
  if (req.method === "GET") {
    return getDCF(req);
  }
  
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: { "Content-Type": "application/json" } }
  );
};

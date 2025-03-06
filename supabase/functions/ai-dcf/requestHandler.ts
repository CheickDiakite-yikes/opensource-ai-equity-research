
import { corsHeaders } from "../_shared/cors.ts";
import { fetchDCFData } from "./services/dcfService.ts";

/**
 * Handle the API request for DCF analysis
 */
export async function handleApiRequest(req: Request): Promise<Response> {
  try {
    // Get symbol from request parameters
    const url = new URL(req.url);
    let symbol = url.searchParams.get("symbol");
    
    // If not in query params, try to get from request body
    if (!symbol && req.method === "POST") {
      const body = await req.json();
      symbol = body.symbol;
    }
    
    // Validate required parameters
    if (!symbol) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameter: symbol" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log(`Processing AI-DCF request for symbol: ${symbol}`);
    
    // Fetch DCF data
    const result = await fetchDCFData(symbol);
    
    // Return the DCF result
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "max-age=3600" // Cache for 1 hour
        } 
      }
    );
    
  } catch (error) {
    console.error("Error in AI-DCF request handler:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unknown error occurred",
        details: error instanceof Error ? error.stack : null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

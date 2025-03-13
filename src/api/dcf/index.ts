
/**
 * DCF API Handler
 * 
 * This file handles DCF calculation requests by proxying them to the Supabase
 * function that communicates with the FMP API.
 */

import { invokeSupabaseFunction } from "@/services/api/base";

export interface DCFParams {
  symbol: string;
  type?: string;
  [key: string]: any;
}

/**
 * Handler for DCF calculation requests
 */
export const handleDCFRequest = async (params: DCFParams): Promise<any> => {
  try {
    const { symbol, type = 'advanced', ...customParams } = params;
    
    if (!symbol) {
      throw new Error("Symbol is required for DCF calculation");
    }
    
    console.log(`DCF API: Processing request for ${symbol}, type: ${type}`);
    
    // Call the Supabase function for DCF calculation
    const data = await invokeSupabaseFunction<any>('get-custom-dcf', {
      symbol,
      type,
      params: customParams
    });
    
    // Check if we received a valid response
    if (!data) {
      throw new Error("No data returned from DCF calculation");
    }
    
    // For empty array responses, throw an error
    if (Array.isArray(data) && data.length === 0) {
      throw new Error(`No DCF data available for ${symbol}`);
    }
    
    return {
      ok: true,
      json: () => Promise.resolve(data),
      headers: new Headers({
        'content-type': 'application/json'
      }),
      status: 200
    };
  } catch (error) {
    console.error("Error in DCF calculation:", error);
    
    // Return a Response-like object with error information
    return {
      ok: false,
      text: () => Promise.resolve(error.message || "Unknown error"),
      headers: new Headers({
        'content-type': 'text/plain'
      }),
      status: 500
    };
  }
};

/**
 * Process a Request object for DCF calculation
 */
export const processDCFRequest = async (request: Request): Promise<Response> => {
  try {
    const url = new URL(request.url);
    const params: DCFParams = { symbol: "" };
    
    // Extract parameters from URL
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    // Validate required parameters
    if (!params.symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Call the handler
    const result = await handleDCFRequest(params);
    
    if (result.ok) {
      return new Response(
        JSON.stringify(await result.json()),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: await result.text() }),
        { status: result.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error processing DCF request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

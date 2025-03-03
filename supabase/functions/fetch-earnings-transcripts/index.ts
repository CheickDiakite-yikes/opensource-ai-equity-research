
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { symbol, limit, quarter, year } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Fetching earnings transcripts for ${symbol}`);
    
    // Construct the API URL based on provided parameters
    let apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}`;
    
    // If quarter and year are provided, fetch a specific transcript
    if (quarter && year) {
      apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}/${quarter}/${year}`;
      console.log(`Fetching specific transcript: ${apiUrl}`);
    } else {
      // Otherwise, fetch the list with optional limit
      const limitParam = limit ? `?limit=${limit}` : "";
      apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}${limitParam}`;
      console.log(`Fetching transcript list: ${apiUrl}`);
    }
    
    // Add the API key
    apiUrl += apiUrl.includes("?") ? `&apikey=${FMP_API_KEY}` : `?apikey=${FMP_API_KEY}`;
    
    // Fetch data from FMP API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`FMP API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `FMP API error: ${response.status}` }),
        { status: response.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const data = await response.json();
    
    // Log the response structure for debugging
    console.log(`Received ${Array.isArray(data) ? data.length : 0} transcripts`);
    if (Array.isArray(data) && data.length > 0) {
      console.log(`First transcript sample: ${JSON.stringify(data[0]).substring(0, 200)}...`);
    }
    
    // Normalize the data to ensure consistent quarter field
    const normalizedData = Array.isArray(data) ? data.map(item => {
      // Make sure we have a consistent "quarter" field
      if (!item.quarter && item.period) {
        item.quarter = item.period;
      }
      return item;
    }) : data;
    
    // Return the data
    return new Response(
      JSON.stringify(normalizedData),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error processing transcript request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

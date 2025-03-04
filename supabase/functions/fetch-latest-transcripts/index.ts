
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { limit = 20 } = await req.json();
    
    console.log(`Fetching latest earnings transcripts, limit: ${limit}`);
    
    // Use the new stable API endpoint for latest transcripts
    const apiUrl = `https://financialmodelingprep.com/stable/earning-call-transcript-latest?apikey=${FMP_API_KEY}`;
    
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
    
    // Ensure we have an array and limit the results
    const transcripts = Array.isArray(data) ? data.slice(0, limit) : [];
    
    // Format the data to match our EarningsCall type
    const formattedData = transcripts.map(item => ({
      symbol: item.symbol,
      date: item.date,
      quarter: item.quarter,
      year: item.year,
      title: `${item.symbol} ${item.quarter} ${item.year} Earnings Call`,
      url: `https://financialmodelingprep.com/api/v3/earning_call_transcript/${item.symbol}/${item.quarter}/${item.year}`,
      content: "" // We don't get content in the latest list
    }));
    
    // Return the formatted data
    return new Response(
      JSON.stringify(formattedData),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error processing latest transcripts request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

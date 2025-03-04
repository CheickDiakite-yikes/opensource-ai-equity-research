
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { from, to, limit = 20 } = await req.json();
    
    console.log(`Fetching latest 8-K SEC filings from ${from || 'N/A'} to ${to || 'N/A'}, limit: ${limit}`);
    
    // Build the API URL based on provided parameters
    let apiUrl = "https://financialmodelingprep.com/stable/sec-filings-8k";
    
    // Add date range parameters if provided
    const queryParams = [];
    if (from) queryParams.push(`from=${from}`);
    if (to) queryParams.push(`to=${to}`);
    
    // Add API key and construct the final URL
    queryParams.push(`apikey=${FMP_API_KEY}`);
    if (queryParams.length > 0) {
      apiUrl += `?${queryParams.join('&')}`;
    }
    
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
    const filings = Array.isArray(data) ? data.slice(0, limit) : [];
    
    // Format the data to match our SECFiling type
    const formattedData = filings.map(filing => ({
      symbol: filing.symbol,
      type: "8-K (Current Report)",
      filingDate: filing.filingDate || filing.acceptedDate,
      reportDate: filing.acceptedDate || filing.filingDate,
      cik: filing.cik,
      form: "8-K",
      url: filing.finalLink || filing.link,
      filingNumber: filing.accessionNumber || 'N/A'
    }));
    
    // Return the formatted data
    return new Response(
      JSON.stringify(formattedData),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error processing latest 8-K SEC filings request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});


import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { formType, from, to, limit = 20 } = await req.json();
    
    if (!formType) {
      return new Response(
        JSON.stringify({ error: "Form type is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Fetching SEC filings by form type: ${formType}`);
    
    // Build the API URL based on provided parameters
    let apiUrl = `https://financialmodelingprep.com/stable/sec-filings-search/form-type?formType=${formType}`;
    
    // Add date range parameters if provided
    if (from) apiUrl += `&from=${from}`;
    if (to) apiUrl += `&to=${to}`;
    
    // Add API key
    apiUrl += `&apikey=${FMP_API_KEY}`;
    
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
    const formattedData = filings.map(filing => {
      // Determine filing type display name
      let typeName = "";
      switch (filing.form) {
        case "10-K": typeName = "10-K (Annual Report)"; break;
        case "10-Q": typeName = "10-Q (Quarterly Report)"; break;
        case "8-K": typeName = "8-K (Current Report)"; break;
        default: typeName = `${filing.form} (SEC Filing)`;
      }
      
      return {
        symbol: filing.symbol,
        type: typeName,
        filingDate: filing.filingDate || filing.acceptedDate,
        reportDate: filing.acceptedDate || filing.filingDate,
        cik: filing.cik,
        form: filing.form,
        url: filing.finalLink || filing.link,
        filingNumber: filing.accessionNumber || 'N/A'
      };
    });
    
    // Return the formatted data
    return new Response(
      JSON.stringify(formattedData),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error processing SEC filings by form request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { symbol, params } = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get API key from environment variables
    const apiKey = Deno.env.get("FMP_API_KEY");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Construct query parameters for the custom DCF
    // Based on the Python example, using the stable/custom-levered-discounted-cash-flow endpoint
    const queryParams = new URLSearchParams({
      apikey: apiKey,
      symbol: symbol,
    });

    // Add custom parameters if provided
    if (params) {
      if (params.revenueGrowthPct !== undefined) queryParams.append('revenueGrowthPct', params.revenueGrowthPct.toString());
      if (params.ebitdaPct !== undefined) queryParams.append('ebitdaPct', params.ebitdaPct.toString());
      if (params.capitalExpenditurePct !== undefined) queryParams.append('capitalExpenditurePct', params.capitalExpenditurePct.toString());
      if (params.taxRate !== undefined) queryParams.append('taxRate', params.taxRate.toString());
      if (params.longTermGrowthRate !== undefined) queryParams.append('longTermGrowthRate', params.longTermGrowthRate.toString());
      if (params.costOfEquity !== undefined) queryParams.append('costOfEquity', params.costOfEquity.toString());
      if (params.costOfDebt !== undefined) queryParams.append('costOfDebt', params.costOfDebt.toString());
      if (params.beta !== undefined) queryParams.append('beta', params.beta.toString());
      if (params.marketRiskPremium !== undefined) queryParams.append('marketRiskPremium', params.marketRiskPremium.toString());
      if (params.riskFreeRate !== undefined) queryParams.append('riskFreeRate', params.riskFreeRate.toString());
    }

    // Use the correct URL format from the Python example
    const url = `https://financialmodelingprep.com/stable/custom-levered-discounted-cash-flow?${queryParams}`;
    
    console.log(`Fetching custom DCF for ${symbol} from: ${url.replace(apiKey, "API_KEY_HIDDEN")}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from FMP API: ${response.status} - ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: `API request failed with status ${response.status}`,
          details: errorText
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const data = await response.json();
    console.log(`Received data from FMP API. Response type: ${typeof data}`);
    if (Array.isArray(data)) {
      console.log(`Received array with ${data.length} items`);
      if (data.length > 0) {
        console.log("Sample item structure:", Object.keys(data[0]).join(", "));
      }
    } else {
      console.log("Received non-array data:", typeof data);
    }
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in get-custom-dcf function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

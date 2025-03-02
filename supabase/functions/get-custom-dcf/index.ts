
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface CustomDCFParams {
  symbol: string;
  revenueGrowthPct: number;
  ebitdaPct: number;
  capitalExpenditurePct: number;
  taxRate: number;
  longTermGrowthRate: number;
  costOfEquity: number;
  costOfDebt: number;
  beta: number;
  marketRiskPremium: number;
  riskFreeRate: number;
}

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

    // Construct the FMP API URL for custom DCF
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
    const queryParams = new URLSearchParams({
      apikey: apiKey,
      symbol: symbol,
      // Add the custom parameters from the request
      revenueGrowthPct: params.revenueGrowthPct.toString(),
      ebitdaPct: params.ebitdaPct.toString(), 
      capitalExpenditurePct: params.capitalExpenditurePct.toString(),
      taxRate: params.taxRate.toString(),
      longTermGrowthRate: params.longTermGrowthRate.toString(),
      costOfEquity: params.costOfEquity.toString(),
      costOfDebt: params.costOfDebt.toString(),
      beta: params.beta.toString(),
      marketRiskPremium: params.marketRiskPremium.toString(),
      riskFreeRate: params.riskFreeRate.toString()
    });

    const url = `https://financialmodelingprep.com/api/v4/advanced_levered_discounted_cash_flow?${queryParams}`;
    
    console.log(`Fetching custom DCF for ${symbol} from: ${url}`);
    
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

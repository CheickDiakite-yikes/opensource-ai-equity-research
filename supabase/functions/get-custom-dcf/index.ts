
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY");
const FMP_BASE_URL = "https://financialmodelingprep.com/api/v4";

interface CustomDCFParams {
  symbol: string;
  revenueGrowthPct: number;
  ebitdaPct: number;
  capitalExpenditurePct: number;
  taxRate: number;
  depreciationAndAmortizationPct: number;
  cashAndShortTermInvestmentsPct: number;
  receivablesPct: number;
  inventoriesPct: number;
  payablesPct: number;
  ebitPct: number;
  operatingCashFlowPct: number;
  sellingGeneralAndAdministrativeExpensesPct: number;
  longTermGrowthRate: number;
  costOfEquity: number;
  costOfDebt: number;
  marketRiskPremium: number;
  riskFreeRate: number;
  beta: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, params } = await req.json();

    if (!symbol || !params) {
      return new Response(
        JSON.stringify({ error: "Symbol and parameters are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!FMP_API_KEY) {
      console.error("FMP_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "API key configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Format the parameters according to FMP API requirements
    // Convert decimal percentages to actual percentages where needed
    const fmpParams = {
      symbol: params.symbol,
      period: 5, // 5-year projection
      revenueGrowth: (params.revenueGrowthPct * 100).toFixed(2), // Convert to percentage format
      ebitdaMargin: (params.ebitdaPct * 100).toFixed(2),
      ebitMargin: (params.ebitPct * 100).toFixed(2),
      netDebtToEbitda: "1.5", // Use a reasonable default
      companyTaxRate: (params.taxRate * 100).toFixed(2),
      costOfDebt: (params.costOfDebt * 100).toFixed(2),
      costOfEquity: (params.costOfEquity * 100).toFixed(2),
      beta: params.beta.toFixed(2),
      dilutedSharesOutstanding: "auto", // Let FMP determine this
      marketRiskPremium: (params.marketRiskPremium * 100).toFixed(2),
      riskFreeRate: (params.riskFreeRate * 100).toFixed(2),
      longTermGrowthRate: (params.longTermGrowthRate * 100).toFixed(2),
      capitalExpenditureToRevenue: (params.capitalExpenditurePct * 100).toFixed(2),
      depreciationAndAmortizationToRevenue: (params.depreciationAndAmortizationPct * 100).toFixed(2),
      cashAndCashEquivalentsToRevenue: (params.cashAndShortTermInvestmentsPct * 100).toFixed(2),
      accountsReceivablesToRevenue: (params.receivablesPct * 100).toFixed(2),
      inventoryToRevenue: (params.inventoriesPct * 100).toFixed(2),
      accountsPayableToRevenue: (params.payablesPct * 100).toFixed(2),
      operatingCashFlowToRevenue: (params.operatingCashFlowPct * 100).toFixed(2),
      sgaToRevenue: (params.sellingGeneralAndAdministrativeExpensesPct * 100).toFixed(2)
    };

    console.log("Sending request to FMP API with parameters:", fmpParams);

    // Construct the query string with all parameters
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(fmpParams)) {
      queryParams.append(key, value.toString());
    }
    queryParams.append("apikey", FMP_API_KEY);

    // Make the request to FMP API
    const url = `${FMP_BASE_URL}/company/discounted-cash-flow/advanced/${symbol}?${queryParams.toString()}`;
    
    console.log(`Calling FMP API: ${url.substring(0, 100)}...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from FMP API: ${response.status} ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: `FMP API error: ${response.status}`,
          details: errorText
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();
    console.log(`Received DCF data for ${symbol}, items: ${Array.isArray(data) ? data.length : 'Not an array'}`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

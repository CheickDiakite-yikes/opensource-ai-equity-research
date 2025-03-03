
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle the request
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const fmpApiKey = Deno.env.get("FMP_API_KEY");
    
    if (!fmpApiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    // Parse request body
    const { symbol, params } = await req.json();
    
    if (!symbol) {
      throw new Error("Symbol is required");
    }
    
    console.log(`Processing custom DCF calculation for ${symbol}`);
    
    // First, get necessary stock data from FMP
    const stockData = await fetchStockData(symbol, fmpApiKey);
    if (!stockData) {
      throw new Error(`Failed to fetch stock data for ${symbol}`);
    }
    
    // Prepare query parameters for FMP DCF API
    const queryParams = prepareQueryParams(params);
    
    // Call the FMP DCF API
    const dcfResult = await fetchCustomDCF(symbol, queryParams, fmpApiKey);
    
    // Return the result
    return new Response(JSON.stringify(dcfResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Error in get-custom-dcf function:`, error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to calculate custom DCF",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Fetch basic stock data
async function fetchStockData(symbol: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error(`Error fetching stock data:`, error);
    throw error;
  }
}

// Prepare query parameters for the FMP DCF API
function prepareQueryParams(params: any) {
  const queryParams = new URLSearchParams();
  
  // Map each parameter to the query string
  // Adding validation to ensure parameters exist and are valid numbers
  if (params.revenueGrowthPct !== undefined) 
    queryParams.append("revenueGrowthPct", params.revenueGrowthPct.toString());
  
  if (params.ebitdaPct !== undefined) 
    queryParams.append("ebitdaPct", params.ebitdaPct.toString());
  
  if (params.depreciationAndAmortizationPct !== undefined) 
    queryParams.append("depreciationAndAmortizationPct", params.depreciationAndAmortizationPct.toString());
  
  if (params.cashAndShortTermInvestmentsPct !== undefined) 
    queryParams.append("cashAndShortTermInvestmentsPct", params.cashAndShortTermInvestmentsPct.toString());
  
  if (params.receivablesPct !== undefined) 
    queryParams.append("receivablesPct", params.receivablesPct.toString());
  
  if (params.inventoriesPct !== undefined) 
    queryParams.append("inventoriesPct", params.inventoriesPct.toString());
  
  if (params.payablesPct !== undefined) 
    queryParams.append("payablesPct", params.payablesPct.toString());
  
  if (params.ebitPct !== undefined) 
    queryParams.append("ebitPct", params.ebitPct.toString());
  
  if (params.capitalExpenditurePct !== undefined) 
    queryParams.append("capitalExpenditurePct", params.capitalExpenditurePct.toString());
  
  if (params.operatingCashFlowPct !== undefined) 
    queryParams.append("operatingCashFlowPct", params.operatingCashFlowPct.toString());
  
  if (params.sellingGeneralAndAdministrativeExpensesPct !== undefined) 
    queryParams.append("sellingGeneralAndAdministrativeExpensesPct", params.sellingGeneralAndAdministrativeExpensesPct.toString());
  
  if (params.taxRate !== undefined) 
    queryParams.append("taxRate", params.taxRate.toString());
  
  if (params.longTermGrowthRate !== undefined) 
    queryParams.append("longTermGrowthRate", params.longTermGrowthRate.toString());
  
  if (params.costOfDebt !== undefined) 
    queryParams.append("costOfDebt", params.costOfDebt.toString());
  
  if (params.costOfEquity !== undefined) 
    queryParams.append("costOfEquity", params.costOfEquity.toString());
  
  if (params.marketRiskPremium !== undefined) 
    queryParams.append("marketRiskPremium", params.marketRiskPremium.toString());
  
  if (params.beta !== undefined) 
    queryParams.append("beta", params.beta.toString());
  
  if (params.riskFreeRate !== undefined) 
    queryParams.append("riskFreeRate", params.riskFreeRate.toString());
  
  return queryParams;
}

// Call the FMP custom DCF API
async function fetchCustomDCF(symbol: string, queryParams: URLSearchParams, apiKey: string) {
  try {
    // Add symbol and API key to query params
    queryParams.append("symbol", symbol);
    queryParams.append("apikey", apiKey);
    
    const url = `https://financialmodelingprep.com/api/v4/advanced_dcf?${queryParams.toString()}`;
    console.log(`Calling FMP API: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FMP API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      throw new Error("Invalid response from FMP API");
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching custom DCF:`, error);
    throw error;
  }
}

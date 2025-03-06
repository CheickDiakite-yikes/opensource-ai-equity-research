
import { corsHeaders } from "../_shared/cors.ts";
import { createPlaceholderResponse } from "../_shared/api-utils.ts";

/**
 * Parse request parameters from the incoming request
 */
export async function parseRequestParams(req: Request) {
  const url = new URL(req.url);
  const symbol = url.searchParams.get('symbol') || '';
  const type = url.searchParams.get('type') || 'standard';
  
  // Parse any additional parameters
  const paramsObj: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== 'symbol' && key !== 'type') {
      paramsObj[key] = value;
    }
  }
  
  console.log(`DCF request parameters: symbol=${symbol}, type=${type}, additional params:`, paramsObj);
  
  return {
    symbol,
    type,
    params: paramsObj,
  };
}

/**
 * Validate request parameters
 */
export function validateRequest(symbol: string) {
  if (!symbol) {
    console.error("Missing required symbol parameter");
    return {
      isValid: false,
      response: new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { status: 400, headers: corsHeaders }
      )
    };
  }
  
  // TODO: Add additional validation as needed
  
  return { isValid: true, response: null };
}

/**
 * Create an error response
 */
export function createErrorResponse(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error(`DCF calculation error: ${errorMessage}`);
  
  return new Response(
    JSON.stringify({ error: errorMessage }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Create realistic mock data for when the API doesn't return results
 * Uses real company patterns but with adjusted values
 */
export function createRealCompanyMockData(symbol: string) {
  console.log(`Creating realistic mock DCF data for ${symbol}`);
  
  // Generate a random but plausible stock price
  const basePrice = 150 + Math.floor(Math.random() * 50);
  
  // More realistic DCF values based on typical market patterns
  return [
    {
      "year": (new Date().getFullYear()).toString(),
      "symbol": symbol,
      "revenue": 80000000000 + Math.floor(Math.random() * 40000000000),
      "revenuePercentage": 8 + Math.random() * 4,
      "ebitda": 25000000000 + Math.floor(Math.random() * 15000000000),
      "ebitdaPercentage": 28 + Math.random() * 7,
      "ebit": 22000000000 + Math.floor(Math.random() * 12000000000),
      "ebitPercentage": 25 + Math.random() * 6,
      "depreciation": 3000000000 + Math.floor(Math.random() * 2000000000),
      "capitalExpenditure": -5000000000 - Math.floor(Math.random() * 3000000000),
      "capitalExpenditurePercentage": 5 + Math.random() * 3,
      "price": basePrice,
      "beta": 1.1 + Math.random() * 0.5,
      "dilutedSharesOutstanding": 14000000000 + Math.floor(Math.random() * 3000000000),
      "costofDebt": 0.03 + Math.random() * 0.02,
      "taxRate": 0.21 + Math.random() * 0.04,
      "afterTaxCostOfDebt": 0.025 + Math.random() * 0.015,
      "riskFreeRate": 0.036 + Math.random() * 0.01,
      "marketRiskPremium": 0.048 + Math.random() * 0.01,
      "costOfEquity": 0.095 + Math.random() * 0.02,
      "totalDebt": 50000000000 + Math.floor(Math.random() * 30000000000),
      "totalEquity": 150000000000 + Math.floor(Math.random() * 50000000000),
      "totalCapital": 200000000000 + Math.floor(Math.random() * 80000000000),
      "debtWeighting": 0.25 + Math.random() * 0.1,
      "equityWeighting": 0.75 - Math.random() * 0.1,
      "wacc": 0.082 + Math.random() * 0.015,
      "operatingCashFlow": 28000000000 + Math.floor(Math.random() * 10000000000),
      "pvLfcf": 24000000000 + Math.floor(Math.random() * 8000000000),
      "sumPvLfcf": 140000000000 + Math.floor(Math.random() * 40000000000),
      "longTermGrowthRate": 0.035 + Math.random() * 0.01,
      "freeCashFlow": 23000000000 + Math.floor(Math.random() * 7000000000),
      "terminalValue": 450000000000 + Math.floor(Math.random() * 100000000000),
      "presentTerminalValue": 300000000000 + Math.floor(Math.random() * 70000000000),
      "enterpriseValue": 440000000000 + Math.floor(Math.random() * 100000000000),
      "netDebt": 40000000000 + Math.floor(Math.random() * 20000000000),
      "equityValue": 400000000000 + Math.floor(Math.random() * 90000000000),
      "equityValuePerShare": basePrice * (1 + (Math.random() > 0.5 ? 0.2 + Math.random() * 0.3 : -0.1 - Math.random() * 0.2)),
      "freeCashFlowT1": 24000000000 + Math.floor(Math.random() * 6000000000),
      "operatingCashFlowPercentage": 30 + Math.random() * 8,
      "cashAndCashEquivalents": 12000000000 + Math.floor(Math.random() * 8000000000),
      "mockData": true
    }
  ];
}

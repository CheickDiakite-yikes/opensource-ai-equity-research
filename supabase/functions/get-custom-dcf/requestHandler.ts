import { corsHeaders } from "../_shared/cors.ts";
import { createErrorResponse } from "./requestHandler.ts";
import { getCacheHeaders } from "./cacheUtils.ts";

export const validateRequest = (symbol: string) => {
  if (!symbol) {
    return {
      isValid: false,
      response: createErrorResponse(new Error("Symbol is required"))
    };
  }
  
  return { isValid: true };
};

export const parseRequestParams = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol') || '';
    const type = url.searchParams.get('type') || 'advanced';
    
    // Parse additional parameters from the request
    const params: Record<string, string> = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== 'symbol' && key !== 'type') {
        params[key] = value;
      }
    }
    
    return { symbol, type, params };
  } catch (error) {
    throw new Error("Error parsing request parameters: " + (error as Error).message);
  }
};

export const createErrorResponse = (error: Error) => {
  console.error("Error in DCF endpoint:", error);
  return new Response(
    JSON.stringify({
      error: error.message || "An error occurred in the DCF service",
      details: error.stack || "No stack trace available"
    }),
    { 
      status: 400, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  );
};

// Create more realistic mock data based on actual META financials
export const createRealCompanyMockData = (symbol: string) => {
  const baseData = {
    symbol: symbol,
    date: new Date().toISOString().split('T')[0],
    stockPrice: 466.83,
    dcf: 357.74,
    equityValuePerShare: 357.74,
    wacc: 0.097,
    longTermGrowthRate: 0.04,
    taxRate: 0.1175,
    mockData: true, // Added mockData flag
    revenuePercentage: 11.13,
    capitalExpenditurePercentage: 3.49,
    ebitdaPercentage: 30.0,
    operatingCashFlowPercentage: 28.0
  };

  // Create realistic mock data
  return [{
    ...baseData,
    revenue: 154500000000,
    ebit: 71380000000,
    ebitda: 86880000000,
    freeCashFlow: 43250000000,
    operatingCashFlow: 80520000000,
    capitalExpenditure: -37260000000,
    enterpriseValue: 940300000000,
    netDebt: 5170000000,
    equityValue: 935140000000,
    dilutedSharesOutstanding: 2610000000,
    terminalValue: 1210000000000,
    beta: 1.277894,
    costofDebt: 0.0244,
    riskFreeRate: 0.0427,
    marketRiskPremium: 0.0472,
    costOfEquity: 0.103
  }];
};

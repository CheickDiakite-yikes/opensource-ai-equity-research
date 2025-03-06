
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
  // Values based on the screenshot for META
  const baseData = {
    symbol: symbol,
    date: new Date().toISOString().split('T')[0],
    stockPrice: 466.83, // Updated to current META price
    dcf: 357.74,        // Updated from screenshot
    equityValuePerShare: 357.74,
    wacc: 0.097,         // From screenshot
    longTermGrowthRate: 0.04, // From screenshot
    taxRate: 0.1175,     // From screenshot
    mockData: true
  };

  if (symbol.toUpperCase() === 'META') {
    return [
      {
        ...baseData,
        // Values from the screenshot for META
        revenue: 154500000000,     // ~154.5B
        ebit: 71380000000,         // ~71.38B
        ebitda: 86880000000,       // ~86.88B
        freeCashFlow: 43250000000, // ~43.25B (ufcf in screenshot)
        operatingCashFlow: 80520000000, // Approximated
        capitalExpenditure: -37260000000, // Approximated from capital expenditures 
        // Additional META-specific data
        enterpriseValue: 940300000000, // 940.3B from screenshot
        netDebt: 5170000000,       // 5.17B from screenshot
        equityValue: 935140000000, // 935.14B from screenshot
        dilutedSharesOutstanding: 2610000000, // 2.61B from screenshot
        terminalValue: 1210000000000 // 1.21T from screenshot
      },
      {
        // Historic data for 2023
        ...baseData,
        year: "2023",
        revenue: 134980000000,
        ebit: 47870000000,
        ebitda: 59050000000,
        freeCashFlow: 20530000000,
        operatingCashFlow: 47810000000,
        capitalExpenditure: -27270000000
      },
      {
        // Historic data for 2022
        ...baseData,
        year: "2022",
        revenue: 116610000000,
        ebit: 33550000000,
        ebitda: 42240000000,
        freeCashFlow: 5750000000,
        operatingCashFlow: 37180000000,
        capitalExpenditure: -31430000000
      },
      {
        // Historic data for 2021
        ...baseData,
        year: "2021",
        revenue: 117938000000,
        ebit: 46753000000,
        ebitda: 54723000000,
        freeCashFlow: 28380000000,
        operatingCashFlow: 46950000000,
        capitalExpenditure: -18570000000
      },
      {
        // Historic data for 2020
        ...baseData,
        year: "2020",
        revenue: 85978000000,
        ebit: 32671000000,
        ebitda: 39533000000,
        freeCashFlow: 10443000000,
        operatingCashFlow: 25563000000,
        capitalExpenditure: -15120000000
      },
      {
        // Projected year 1
        ...baseData,
        year: "2024",
        revenue: 194810000000,
        ebit: 72200000000,
        ebitda: 87740000000,
        freeCashFlow: 29510000000,
        operatingCashFlow: 69700000000,
        capitalExpenditure: -40190000000
      },
      {
        // Projected year 2
        ...baseData,
        year: "2025",
        revenue: 230700000000,
        ebit: 85500000000,
        ebitda: 103900000000,
        freeCashFlow: 40060000000,
        operatingCashFlow: 87650000000,
        capitalExpenditure: -47590000000
      },
      {
        // Projected year 3
        ...baseData,
        year: "2026",
        revenue: 273200000000,
        ebit: 101250000000,
        ebitda: 123050000000,
        freeCashFlow: 47440000000,
        operatingCashFlow: 103800000000,
        capitalExpenditure: -56360000000
      },
      {
        // Projected year 4
        ...baseData,
        year: "2027",
        revenue: 323530000000,
        ebit: 119900000000,
        ebitda: 145720000000,
        freeCashFlow: 56180000000,
        operatingCashFlow: 122920000000,
        capitalExpenditure: -66740000000
      },
      {
        // Projected year 5
        ...baseData,
        year: "2028",
        revenue: 383130000000,
        ebit: 141990000000,
        ebitda: 172560000000,
        freeCashFlow: 66530000000,
        operatingCashFlow: 145560000000,
        capitalExpenditure: -79030000000
      }
    ];
  }
  
  // For other symbols, use generic mock data
  return [{
    ...baseData,
    revenue: 20000000000,
    ebit: 5000000000,
    ebitda: 8000000000,
    freeCashFlow: 5000000000,
    operatingCashFlow: 6000000000,
    capitalExpenditure: -1000000000,
    terminalValue: 75000000000
  }];
};

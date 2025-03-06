
import { corsHeaders } from "../_shared/cors.ts";

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
    // For POST requests, we'll parse the JSON body
    if (req.method === 'POST') {
      const body = await req.json().catch(error => {
        console.error("Failed to parse request body:", error);
        throw new Error("Invalid request body");
      });
      
      const symbol = body.symbol || '';
      const type = body.type || 'advanced';
      const params = { ...(body.params || {}) };
      
      console.log("Parsed POST request parameters:", { symbol, type, paramsCount: Object.keys(params).length });
      
      return { symbol, type, params };
    } 
    // For GET requests, we'll parse the URL search params
    else {
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
      
      console.log("Parsed GET request parameters:", { symbol, type, paramsCount: Object.keys(params).length });
      
      return { symbol, type, params };
    }
  } catch (error) {
    console.error("Error parsing request parameters:", error);
    throw new Error("Error parsing request parameters: " + (error as Error).message);
  }
};

export const createErrorResponse = (error: Error) => {
  console.error("Error in DCF endpoint:", error);
  return new Response(
    JSON.stringify({
      error: error.message || "An error occurred in the DCF service",
      details: error.stack || "No stack trace available",
      mockData: true
    }),
    { 
      status: 400, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Error-Type': 'DCF-Calculation-Error'
      } 
    }
  );
};

// Create more realistic mock data based on actual company financials
export const createRealCompanyMockData = (symbol: string) => {
  console.log(`Creating realistic mock data for ${symbol}`);
  
  // Base data structure that all mock objects will use
  const baseData = {
    symbol: symbol,
    date: new Date().toISOString().split('T')[0],
    mockData: true
  };

  // Different mock data based on company
  if (symbol.toUpperCase() === 'META') {
    return [
      {
        ...baseData,
        year: "2023",
        symbol: "META",
        revenue: 134930000000,
        revenuePercentage: 11.13,
        ebitda: 59050000000,
        ebitdaPercentage: 43.76,
        ebit: 47870000000,
        ebitPercentage: 35.48,
        depreciation: 11180000000,
        capitalExpenditure: -27270000000,
        capitalExpenditurePercentage: -3.49,
        price: 466.83,
        beta: 1.277894,
        dilutedSharesOutstanding: 2610000000,
        costofDebt: 0.0244,
        taxRate: 16.2,
        afterTaxCostOfDebt: 0.0205,
        riskFreeRate: 4.27,
        marketRiskPremium: 4.72,
        costOfEquity: 10.3,
        totalDebt: 18008000000,
        totalEquity: 145553000000,
        totalCapital: 163561000000,
        debtWeighting: 0.11,
        equityWeighting: 0.89,
        wacc: 0.097,
        operatingCashFlow: 47810000000,
        freeCashFlow: 20530000000,
        freeCashFlowT1: 21970000000,
        longTermGrowthRate: 0.04,
        terminalValue: 121000000000,
        presentTerminalValue: 756600000000,
        enterpriseValue: 940300000000,
        netDebt: 5170000000,
        equityValue: 935140000000,
        equityValuePerShare: 357.74,
        operatingCashFlowPercentage: 35.43,
        cashAndCashEquivalents: 17262000000
      },
      {
        ...baseData,
        year: "2022",
        symbol: "META",
        revenue: 116610000000,
        revenuePercentage: -1.13,
        ebitda: 42240000000,
        ebitdaPercentage: 36.22,
        ebit: 33550000000,
        ebitPercentage: 28.77,
        depreciation: 8690000000,
        capitalExpenditure: -31430000000,
        capitalExpenditurePercentage: -5.12,
        price: 466.83,
        beta: 1.277894,
        dilutedSharesOutstanding: 2610000000,
        costofDebt: 0.0244,
        taxRate: 16.2,
        afterTaxCostOfDebt: 0.0205,
        riskFreeRate: 4.27,
        marketRiskPremium: 4.72,
        costOfEquity: 10.3,
        totalDebt: 18008000000,
        totalEquity: 145553000000,
        totalCapital: 163561000000,
        debtWeighting: 0.11,
        equityWeighting: 0.89,
        wacc: 0.097,
        operatingCashFlow: 37180000000,
        freeCashFlow: 5750000000,
        freeCashFlowT1: 6160000000,
        longTermGrowthRate: 0.04,
        terminalValue: 121000000000,
        presentTerminalValue: 756600000000,
        enterpriseValue: 940300000000,
        netDebt: 5170000000,
        equityValue: 935140000000,
        equityValuePerShare: 357.74,
        operatingCashFlowPercentage: 31.88,
        cashAndCashEquivalents: 14681000000
      },
      // Future projection years
      {
        ...baseData,
        year: "2024",
        symbol: "META",
        revenue: 194810000000,
        revenuePercentage: 10.2,
        ebitda: 87740000000,
        ebitdaPercentage: 45.04,
        ebit: 72200000000,
        ebitPercentage: 37.06,
        depreciation: 15540000000,
        capitalExpenditure: -40190000000,
        capitalExpenditurePercentage: -3.46,
        operatingCashFlow: 69700000000,
        freeCashFlow: 29510000000,
        price: 466.83,
        beta: 1.277894,
        dilutedSharesOutstanding: 2610000000,
        costofDebt: 0.0244,
        taxRate: 16.2,
        afterTaxCostOfDebt: 0.0205,
        riskFreeRate: 4.27,
        marketRiskPremium: 4.72,
        costOfEquity: 10.3,
        wacc: 0.097,
        longTermGrowthRate: 0.04,
        equityValuePerShare: 357.74,
        operatingCashFlowPercentage: 35.78
      },
      {
        ...baseData,
        year: "2025",
        symbol: "META",
        revenue: 230700000000,
        revenuePercentage: 9.8,
        ebitda: 103900000000,
        ebitdaPercentage: 45.04,
        ebit: 85500000000,
        ebitPercentage: 37.06,
        depreciation: 18400000000,
        capitalExpenditure: -47590000000,
        capitalExpenditurePercentage: -3.42,
        operatingCashFlow: 87650000000,
        freeCashFlow: 40060000000,
        price: 466.83,
        beta: 1.277894,
        dilutedSharesOutstanding: 2610000000,
        costofDebt: 0.0244,
        taxRate: 16.2,
        afterTaxCostOfDebt: 0.0205,
        riskFreeRate: 4.27,
        marketRiskPremium: 4.72,
        costOfEquity: 10.3,
        wacc: 0.097,
        longTermGrowthRate: 0.04,
        equityValuePerShare: 357.74,
        operatingCashFlowPercentage: 38.0
      },
      {
        ...baseData,
        year: "2026",
        symbol: "META",
        revenue: 273200000000,
        revenuePercentage: 9.5,
        ebitda: 123050000000,
        ebitdaPercentage: 45.04,
        ebit: 101250000000,
        ebitPercentage: 37.06,
        depreciation: 21800000000,
        capitalExpenditure: -56360000000,
        capitalExpenditurePercentage: -3.39,
        operatingCashFlow: 103800000000,
        freeCashFlow: 47440000000,
        price: 466.83,
        beta: 1.277894,
        dilutedSharesOutstanding: 2610000000,
        costofDebt: 0.0244,
        taxRate: 16.2,
        afterTaxCostOfDebt: 0.0205,
        riskFreeRate: 4.27,
        marketRiskPremium: 4.72,
        costOfEquity: 10.3,
        wacc: 0.097,
        longTermGrowthRate: 0.04,
        equityValuePerShare: 357.74,
        operatingCashFlowPercentage: 38.0
      }
    ];
  } 
  else if (symbol.toUpperCase() === 'AAPL') {
    return [
      {
        ...baseData,
        year: "2023",
        symbol: "AAPL",
        revenue: 383900000000,
        revenuePercentage: -2.5,
        ebitda: 143400000000,
        ebitdaPercentage: 37.35,
        ebit: 114300000000,
        ebitPercentage: 29.77,
        depreciation: 29100000000,
        capitalExpenditure: -14000000000,
        capitalExpenditurePercentage: -3.49,
        price: 195.95,
        beta: 1.29,
        dilutedSharesOutstanding: 15640100000,
        costofDebt: 0.0344,
        taxRate: 16.2,
        afterTaxCostOfDebt: 0.0289,
        riskFreeRate: 4.27,
        marketRiskPremium: 4.72,
        costOfEquity: 10.37,
        totalDebt: 120100000000,
        totalEquity: 95400000000,
        totalCapital: 215500000000,
        debtWeighting: 0.56,
        equityWeighting: 0.44,
        wacc: 0.0704,
        operatingCashFlow: 113000000000,
        freeCashFlow: 99000000000,
        freeCashFlowT1: 103400000000,
        longTermGrowthRate: 0.04,
        terminalValue: 1640000000000,
        presentTerminalValue: 998100000000,
        enterpriseValue: 2175500000000,
        netDebt: -36200000000,
        equityValue: 2217700000000,
        equityValuePerShare: 138.60,
        operatingCashFlowPercentage: 29.41,
        cashAndCashEquivalents: 29900000000
      },
      // Future projections
      {
        ...baseData,
        year: "2024",
        symbol: "AAPL",
        revenue: 401120000000,
        revenuePercentage: 4.5,
        ebitda: 150780000000,
        ebitdaPercentage: 37.59,
        ebit: 120400000000,
        ebitPercentage: 30.02,
        depreciation: 30380000000,
        capitalExpenditure: -15000000000,
        capitalExpenditurePercentage: -3.74,
        operatingCashFlow: 118500000000,
        freeCashFlow: 103500000000,
        price: 195.95,
        beta: 1.29,
        dilutedSharesOutstanding: 15270000000,
        costofDebt: 0.0344,
        taxRate: 16.2,
        afterTaxCostOfDebt: 0.0289,
        riskFreeRate: 4.27,
        marketRiskPremium: 4.72,
        costOfEquity: 10.37,
        wacc: 0.0704,
        longTermGrowthRate: 0.04,
        equityValuePerShare: 138.60,
        operatingCashFlowPercentage: 29.53
      }
    ];
  }
  
  // Generic mock data for other companies
  console.log(`Using generic mock data template for ${symbol}`);
  return [
    {
      ...baseData,
      year: new Date().getFullYear().toString(),
      symbol: symbol,
      revenue: 15000000000,
      revenuePercentage: 7.5,
      ebitda: 6000000000,
      ebitdaPercentage: 40.0,
      ebit: 4500000000,
      ebitPercentage: 30.0,
      depreciation: 1500000000,
      capitalExpenditure: -750000000,
      capitalExpenditurePercentage: -5.0,
      price: 100.0,
      beta: 1.2,
      dilutedSharesOutstanding: 500000000,
      costofDebt: 0.045,
      taxRate: 21.0,
      afterTaxCostOfDebt: 0.03555,
      riskFreeRate: 4.0,
      marketRiskPremium: 5.0,
      costOfEquity: 10.0,
      totalDebt: 4000000000,
      totalEquity: 16000000000,
      totalCapital: 20000000000,
      debtWeighting: 0.2,
      equityWeighting: 0.8,
      wacc: 0.087,
      operatingCashFlow: 5000000000,
      freeCashFlow: 4250000000,
      freeCashFlowT1: 4500000000,
      longTermGrowthRate: 0.03,
      terminalValue: 70000000000,
      presentTerminalValue: 45000000000,
      enterpriseValue: 60000000000,
      netDebt: 3000000000,
      equityValue: 57000000000,
      equityValuePerShare: 114.0,
      operatingCashFlowPercentage: 33.33,
      cashAndCashEquivalents: 2000000000
    },
    // Future projection
    {
      ...baseData,
      year: (new Date().getFullYear() + 1).toString(),
      symbol: symbol,
      revenue: 16500000000,
      revenuePercentage: 7.5,
      ebitda: 6600000000,
      ebitdaPercentage: 40.0,
      ebit: 4950000000,
      ebitPercentage: 30.0,
      depreciation: 1650000000,
      capitalExpenditure: -825000000,
      capitalExpenditurePercentage: -5.0,
      operatingCashFlow: 5500000000,
      freeCashFlow: 4675000000,
      price: 100.0,
      beta: 1.2,
      longTermGrowthRate: 0.03,
      wacc: 0.087,
      equityValuePerShare: 114.0,
      operatingCashFlowPercentage: 33.33
    }
  ];
};

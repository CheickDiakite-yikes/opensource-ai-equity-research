
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Parse request parameters
 */
export const parseRequestParams = async (req: Request) => {
  try {
    const body = await req.json();
    const symbol = body.symbol;
    const type = body.type || 'advanced';
    const params = body.params || {};
    
    console.log(`Parsed request params - Symbol: ${symbol}, Type: ${type}, Params:`, params);
    
    return { symbol, type, params };
  } catch (error) {
    console.error(`Error parsing request params: ${error}`);
    throw new Error(`Failed to parse request body: ${error.message}`);
  }
};

/**
 * Validate the request parameters
 */
export const validateRequest = (symbol: string) => {
  if (!symbol) {
    console.error('Missing required parameter: symbol');
    return {
      isValid: false,
      response: new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }
  
  // Additional validations could be added here
  
  return { isValid: true };
};

/**
 * Create a standardized error response
 */
export const createErrorResponse = (error: Error) => {
  console.error(`Creating error response: ${error.message}`);
  
  return new Response(
    JSON.stringify({
      error: error.message || 'An unknown error occurred',
      timestamp: new Date().toISOString(),
      details: error.stack?.split('\n').slice(0, 3).join('\n') || 'No stack trace available'
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
};

/**
 * Create realistic mock data for a company
 */
export const createRealCompanyMockData = (symbol: string) => {
  const currentYear = new Date().getFullYear();
  
  // Default mock data based on typical values
  const mockData = [
    {
      year: currentYear.toString(),
      symbol: symbol,
      mockData: true,
      revenue: 100000000000,
      revenuePercentage: 8.5,
      ebitda: 35000000000,
      ebitdaPercentage: 35.0,
      ebit: 30000000000,
      ebitPercentage: 30.0,
      depreciation: 5000000000,
      capitalExpenditure: -7000000000,
      capitalExpenditurePercentage: 7.0,
      price: 175.0,
      beta: 1.25,
      dilutedSharesOutstanding: 15000000000,
      costofDebt: 3.5,
      taxRate: 21.0,
      afterTaxCostOfDebt: 2.765,
      riskFreeRate: 4.0,
      marketRiskPremium: 5.0,
      costOfEquity: 10.25,
      totalDebt: 100000000000,
      totalEquity: 350000000000,
      totalCapital: 450000000000,
      debtWeighting: 0.22,
      equityWeighting: 0.78,
      wacc: 8.6,
      operatingCashFlow: 40000000000,
      pvLfcf: 30000000000,
      sumPvLfcf: 150000000000,
      longTermGrowthRate: 0.03,
      freeCashFlow: 33000000000,
      terminalValue: 600000000000,
      presentTerminalValue: 400000000000,
      enterpriseValue: 550000000000,
      netDebt: 80000000000,
      equityValue: 470000000000,
      equityValuePerShare: 31.33,
      freeCashFlowT1: 34000000000,
      operatingCashFlowPercentage: 40.0,
      cashAndCashEquivalents: 20000000000
    }
  ];
  
  // Customize based on specific symbols if needed
  const symbolAdjustments: Record<string, any> = {
    'AAPL': {
      revenue: 394328000000,
      ebitda: 139437000000,
      ebit: 119437000000,
      price: 145.91,
      beta: 1.27,
      dilutedSharesOutstanding: 16325819000,
      equityValuePerShare: 178.50,
      totalDebt: 120069000000,
      totalEquity: 2500000000000
    },
    'MSFT': {
      revenue: 211915000000,
      ebitda: 131934000000,
      ebit: 88523000000,
      price: 328.79,
      beta: 0.91,
      dilutedSharesOutstanding: 7429000000,
      equityValuePerShare: 375.21,
      totalDebt: 88143000000,
      totalEquity: 1850000000000
    },
    'GOOG': {
      revenue: 307394000000,
      ebitda: 106012000000,
      ebit: 84313000000,
      price: 124.67,
      beta: 1.06,
      dilutedSharesOutstanding: 12700000000,
      equityValuePerShare: 147.80,
      totalDebt: 30000000000,
      totalEquity: 1900000000000
    },
    'META': {
      revenue: 116609000000,
      ebitda: 50013000000,
      ebit: 39517000000,
      price: 326.49,
      beta: 1.34,
      dilutedSharesOutstanding: 2573000000,
      equityValuePerShare: 380.75,
      totalDebt: 18000000000,
      totalEquity: 980000000000
    }
  };
  
  // Apply adjustments if we have specific data for the symbol
  if (symbol in symbolAdjustments) {
    const adjustments = symbolAdjustments[symbol];
    mockData[0] = { ...mockData[0], ...adjustments };
    
    // Recalculate dependent values
    const revenue = mockData[0].revenue;
    mockData[0].revenuePercentage = 8.5;
    mockData[0].ebitdaPercentage = (mockData[0].ebitda / revenue) * 100;
    mockData[0].ebitPercentage = (mockData[0].ebit / revenue) * 100;
    mockData[0].depreciation = mockData[0].ebitda - mockData[0].ebit;
    mockData[0].capitalExpenditure = -(revenue * (mockData[0].capitalExpenditurePercentage / 100));
    mockData[0].operatingCashFlow = mockData[0].ebit + mockData[0].depreciation;
    mockData[0].freeCashFlow = mockData[0].operatingCashFlow + mockData[0].capitalExpenditure;
    mockData[0].operatingCashFlowPercentage = (mockData[0].operatingCashFlow / revenue) * 100;
  }
  
  console.log(`Created mock data for ${symbol}`);
  return mockData;
};

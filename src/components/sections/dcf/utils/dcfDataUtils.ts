import { 
  AIDCFSuggestion, 
  CustomDCFParams, 
  CustomDCFResult, 
  YearlyDCFData,
  DCFSensitivityData,
  DCFProjections,
  DCFAssumptionsSummary,
  FormattedDCFData
} from "@/types/ai-analysis/dcfTypes";

/**
 * Convert AI assumptions to CustomDCFParams format
 */
export const convertAssumptionsToParams = (
  assumptions: AIDCFSuggestion | null,
  symbol: string,
  financials: any[]
): CustomDCFParams => {
  if (!assumptions) {
    return createDefaultParams(symbol, financials);
  }

  return {
    symbol,
    // Growth parameters
    revenueGrowthPct: assumptions.assumptions.revenueGrowthPct,
    ebitdaPct: assumptions.assumptions.ebitdaMarginPct,
    capitalExpenditurePct: assumptions.assumptions.capitalExpenditurePct,
    taxRate: assumptions.assumptions.taxRatePct,
    
    // Working capital parameters
    depreciationAndAmortizationPct: assumptions.assumptions.depreciationAndAmortizationPct,
    cashAndShortTermInvestmentsPct: assumptions.assumptions.cashAndShortTermInvestmentsPct,
    receivablesPct: assumptions.assumptions.receivablesPct,
    inventoriesPct: assumptions.assumptions.inventoriesPct,
    payablesPct: assumptions.assumptions.payablesPct,
    ebitPct: assumptions.assumptions.ebitPct,
    operatingCashFlowPct: assumptions.assumptions.operatingCashFlowPct,
    sellingGeneralAndAdministrativeExpensesPct: assumptions.assumptions.sellingGeneralAndAdministrativeExpensesPct,
    
    // Rate parameters
    longTermGrowthRate: assumptions.assumptions.longTermGrowthRatePct,
    costOfEquity: assumptions.assumptions.costOfEquityPct,
    costOfDebt: assumptions.assumptions.costOfDebtPct,
    marketRiskPremium: assumptions.assumptions.marketRiskPremiumPct,
    riskFreeRate: assumptions.assumptions.riskFreeRatePct,
    
    // Other
    beta: assumptions.assumptions.beta
  };
};

/**
 * Create default parameters when AI assumptions are not available
 */
const createDefaultParams = (symbol: string, financials: any[]): CustomDCFParams => {
  return {
    symbol,
    // Growth parameters (as decimals)
    revenueGrowthPct: 0.0850,
    ebitdaPct: 0.3127,
    capitalExpenditurePct: 0.0306,
    taxRate: 0.21,
    
    // Working capital parameters (as decimals)
    depreciationAndAmortizationPct: 0.0345,
    cashAndShortTermInvestmentsPct: 0.2344,
    receivablesPct: 0.1533,
    inventoriesPct: 0.0155,
    payablesPct: 0.1614,
    ebitPct: 0.2781,
    operatingCashFlowPct: 0.2886,
    sellingGeneralAndAdministrativeExpensesPct: 0.0662,
    
    // Rate parameters (as decimals for calculation)
    longTermGrowthRate: 0.03, // 3%
    costOfEquity: 0.0951, // 9.51%
    costOfDebt: 0.0364, // 3.64%
    marketRiskPremium: 0.0472, // 4.72%
    riskFreeRate: 0.0364, // 3.64%
    
    // Other
    beta: financials[0]?.beta || 1.244,
  };
};

/**
 * Prepare mock DCF data for when real data is not available
 */
export const prepareMockDCFData = (financials: any[]): FormattedDCFData => {
  const latestFinancial = getLatestFinancial(financials);
  const currentPrice = latestFinancial?.price || 100;
  
  // Use real financial data if available, otherwise use defaults
  const financialMetrics = extractFinancialMetrics(latestFinancial);
  const mockProjections = createMockProjections(financialMetrics);
  const mockSensitivity = createMockSensitivityAnalysis(currentPrice);
  
  return {
    intrinsicValue: calculateMockIntrinsicValue(financialMetrics, currentPrice),
    assumptions: {
      growthRate: "8.5% (first 5 years), 3% (terminal)",
      discountRate: "9.5%",
      terminalMultiple: "15x",
      taxRate: "21%"
    },
    projections: mockProjections,
    sensitivity: mockSensitivity
  };
};

/**
 * Extract key financial metrics from the latest financial data
 */
const extractFinancialMetrics = (latestFinancial: any) => {
  const revenue = latestFinancial?.revenue || 10000;
  const operatingIncome = latestFinancial?.operatingIncome || revenue * 0.20;
  const netIncome = latestFinancial?.netIncome || revenue * 0.15;
  const sharesOutstanding = latestFinancial?.sharesOutstanding || 1000000000;
  
  return { revenue, operatingIncome, netIncome, sharesOutstanding };
};

/**
 * Get the latest financial data from the financials array
 */
const getLatestFinancial = (financials: any[]) => {
  if (!financials || financials.length === 0) return null;
  
  return financials.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
};

/**
 * Calculate mock intrinsic value based on financial metrics
 */
const calculateMockIntrinsicValue = (metrics: { netIncome: number, sharesOutstanding: number }, currentPrice: number): number => {
  const { netIncome, sharesOutstanding } = metrics;
  
  // Generate a reasonable intrinsic value based on PE ratio (15-25x earnings is common)
  // We'll use 20x as a middle ground
  const peRatio = 20;
  const estimatedIntrinsicValue = netIncome > 0 
    ? (netIncome / sharesOutstanding) * peRatio
    : currentPrice * 1.15; // Fallback
    
  return Math.max(estimatedIntrinsicValue, currentPrice * 0.75); // Realistic valuation
};

/**
 * Create mock sensitivity analysis table
 */
const createMockSensitivityAnalysis = (currentPrice: number): DCFSensitivityData => {
  return {
    headers: ["", "8.5%", "9.0%", "9.5%", "10.0%", "10.5%"],
    rows: [
      { growth: "2.0%", values: [currentPrice * 1.20, currentPrice * 1.15, currentPrice * 1.10, currentPrice * 1.05, currentPrice * 1.00] },
      { growth: "2.5%", values: [currentPrice * 1.25, currentPrice * 1.20, currentPrice * 1.15, currentPrice * 1.10, currentPrice * 1.05] },
      { growth: "3.0%", values: [currentPrice * 1.30, currentPrice * 1.25, currentPrice * 1.20, currentPrice * 1.15, currentPrice * 1.10] },
      { growth: "3.5%", values: [currentPrice * 1.35, currentPrice * 1.30, currentPrice * 1.25, currentPrice * 1.20, currentPrice * 1.15] },
      { growth: "4.0%", values: [currentPrice * 1.40, currentPrice * 1.35, currentPrice * 1.30, currentPrice * 1.25, currentPrice * 1.20] }
    ]
  };
};

/**
 * Create mock projections for 5 years
 */
const createMockProjections = (metrics: { revenue: number, operatingIncome: number, netIncome: number }): YearlyDCFData[] => {
  const { revenue, operatingIncome, netIncome } = metrics;
  
  // Create growth rate estimates (realistic growth tapering)
  const growthRates = [0.085, 0.08, 0.075, 0.07, 0.065];
  const currentYear = new Date().getFullYear();
  
  return [1, 2, 3, 4, 5].map(year => {
    // Apply growth rate with tapering growth (more realistic)
    const yearIndex = year - 1;
    const yearGrowth = growthRates[yearIndex] || 0.065;
    const cumulativeGrowth = Math.pow(1 + yearGrowth, year);
    
    // Estimated values based on revenue
    const mockRevenue = Math.round(revenue * cumulativeGrowth);
    const mockEbit = Math.round(operatingIncome * cumulativeGrowth);
    const mockEbitda = Math.round(mockEbit * 1.2); // Approximate EBITDA
    const mockFcf = Math.round(netIncome * 0.8 * cumulativeGrowth);
    
    return {
      year: `${currentYear + year - 1}`,
      revenue: mockRevenue,
      ebit: mockEbit,
      ebitda: mockEbitda,
      freeCashFlow: mockFcf,
      operatingCashFlow: mockFcf * 1.25, // Approximate operating cash flow
      capitalExpenditure: mockFcf * -0.25 // Approximate capex (negative)
    };
  });
};

/**
 * Create formatted DCF data from API results
 */
export const prepareDCFData = (
  customDCFResult: CustomDCFResult | null,
  assumptions: AIDCFSuggestion | null,
  projectedData: YearlyDCFData[],
  mockSensitivity: DCFSensitivityData
): FormattedDCFData => {
  // Return mock data if DCF result is null
  if (!customDCFResult) {
    return prepareMockDCFData([{ price: 100 }]);
  }
  
  // Process and validate the incoming data
  const intrinsicValue = parseIntrinsicValue(customDCFResult.equityValuePerShare);
  const assumptionsSummary = createAssumptionsSummary(assumptions, customDCFResult);
  const sortedProjections = formatAndSortProjections(projectedData);
  
  return {
    intrinsicValue,
    assumptions: assumptionsSummary,
    projections: sortedProjections,
    sensitivity: mockSensitivity // Always use mock sensitivity data since the API doesn't return this
  };
};

/**
 * Parse and validate the intrinsic value
 */
const parseIntrinsicValue = (valuePerShare: number): number => {
  const intrinsicValue = parseFloat(valuePerShare.toString());
  
  // Don't allow negative or extremely high intrinsic values
  if (isNaN(intrinsicValue) || intrinsicValue <= 0 || intrinsicValue > 1000000) {
    return 100; // Return a reasonable default
  }
  
  return intrinsicValue;
};

/**
 * Create a summary of DCF assumptions
 */
const createAssumptionsSummary = (
  assumptions: AIDCFSuggestion | null, 
  customDCFResult: CustomDCFResult
): DCFAssumptionsSummary => {
  // Use calculated/reasonable values or fallback to defaults
  const growthRateInitial = (assumptions?.assumptions.revenueGrowthPct || 
    (customDCFResult.revenuePercentage ? customDCFResult.revenuePercentage / 100 : null) || 0.085) * 100;
  
  const growthRateTerminal = (assumptions?.assumptions.longTermGrowthRatePct || 
    customDCFResult.longTermGrowthRate || 0.03) * 100;
  
  const taxRate = (customDCFResult.taxRate || 0.21) * 100;
  const waccPercent = (customDCFResult.wacc || 0.095) * 100;
  
  return {
    growthRate: `${growthRateInitial.toFixed(1)}% (first 5 years), ${growthRateTerminal.toFixed(1)}% (terminal)`,
    discountRate: `${waccPercent.toFixed(2)}%`,
    terminalMultiple: "DCF Model",
    taxRate: `${taxRate.toFixed(1)}%`
  };
};

/**
 * Format and sort projections data by year
 */
const formatAndSortProjections = (projectedData: YearlyDCFData[]): YearlyDCFData[] => {
  if (!projectedData || projectedData.length === 0) {
    return [];
  }
  
  return [...projectedData]
    .sort((a, b) => {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      return yearA - yearB;
    })
    .map(yearData => ({
      year: yearData.year || `Year`,
      revenue: yearData.revenue || 0,
      ebit: yearData.ebit || 0,
      ebitda: yearData.ebitda || 0,
      freeCashFlow: yearData.freeCashFlow || 0,
      operatingCashFlow: yearData.operatingCashFlow || 0,
      capitalExpenditure: yearData.capitalExpenditure || 0
    }));
};

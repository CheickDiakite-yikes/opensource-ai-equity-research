
import { AIDCFSuggestion, CustomDCFParams, CustomDCFResult } from "@/types/ai-analysis/dcfTypes";

// Convert AI assumptions to CustomDCFParams
export const convertAssumptionsToParams = (
  assumptions: AIDCFSuggestion | null,
  symbol: string,
  financials: any[]
): CustomDCFParams => {
  if (!assumptions) {
    // Fallback default parameters
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

// Prepare mock DCF data for when real data is not available
export const prepareMockDCFData = (financials: any[]) => {
  const currentPrice = financials[0]?.price || 100;
  
  return {
    intrinsicValue: currentPrice * 1.15, // More realistic mock value (15% upside)
    assumptions: {
      growthRate: "8.5% (first 5 years), 3% (terminal)",
      discountRate: "9.5%",
      terminalMultiple: "15x",
      taxRate: "21%"
    },
    projections: [1, 2, 3, 4, 5].map(year => ({
      year: `Year ${year}`,
      revenue: financials[0]?.revenue ? (financials[0].revenue * Math.pow(1.085, year)) : 10000 * Math.pow(1.085, year),
      ebit: financials[0]?.operatingIncome ? (financials[0].operatingIncome * Math.pow(1.09, year)) : 2000 * Math.pow(1.09, year),
      fcf: financials[0]?.netIncome ? (financials[0].netIncome * 0.8 * Math.pow(1.075, year)) : 1500 * Math.pow(1.075, year)
    })),
    sensitivity: {
      headers: ["", "9.0%", "9.5%", "10.0%", "10.5%", "11.0%"],
      rows: [
        { growth: "2.0%", values: [currentPrice * 1.1, currentPrice * 1.05, currentPrice, currentPrice * 0.95, currentPrice * 0.9] },
        { growth: "2.5%", values: [currentPrice * 1.15, currentPrice * 1.1, currentPrice * 1.05, currentPrice, currentPrice * 0.95] },
        { growth: "3.0%", values: [currentPrice * 1.2, currentPrice * 1.15, currentPrice * 1.1, currentPrice * 1.05, currentPrice] },
        { growth: "3.5%", values: [currentPrice * 1.25, currentPrice * 1.2, currentPrice * 1.15, currentPrice * 1.1, currentPrice * 1.05] },
        { growth: "4.0%", values: [currentPrice * 1.3, currentPrice * 1.25, currentPrice * 1.2, currentPrice * 1.15, currentPrice * 1.1] }
      ]
    }
  };
};

// Prepare DCF data from custom DCF result
export const prepareDCFData = (
  customDCFResult: CustomDCFResult,
  assumptions: AIDCFSuggestion | null,
  projectedData: any[],
  mockSensitivity: any
) => {
  // Ensure we have valid data for the intrinsic value
  const intrinsicValue = parseFloat(customDCFResult.equityValuePerShare.toString());
  
  // Use calculated/reasonable values or fallback to defaults
  const growthRateInitial = (assumptions?.assumptions.revenueGrowthPct || 0.085) * 100;
  const growthRateTerminal = (assumptions?.assumptions.longTermGrowthRatePct || 0.03) * 100;
  const taxRate = (customDCFResult.taxRate || 0.21) * 100;
  
  return {
    intrinsicValue: isNaN(intrinsicValue) || intrinsicValue <= 0 ? 100 : intrinsicValue,
    assumptions: {
      growthRate: `${growthRateInitial.toFixed(1)}% (first 5 years), ${growthRateTerminal.toFixed(1)}% (terminal)`,
      discountRate: `${(customDCFResult.wacc * 100).toFixed(2)}%`,
      terminalMultiple: "DCF Model",
      taxRate: `${taxRate.toFixed(1)}%`
    },
    projections: projectedData.map((yearData, index) => ({
      year: `Year ${index + 1}`,
      revenue: yearData.revenue || 0,
      ebit: yearData.ebit || 0,
      fcf: yearData.freeCashFlow || 0
    })),
    sensitivity: mockSensitivity
  };
};

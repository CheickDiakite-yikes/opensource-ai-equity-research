import { 
  AIDCFSuggestion, 
  CustomDCFParams
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

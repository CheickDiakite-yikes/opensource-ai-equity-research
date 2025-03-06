
import { YearlyDCFData, CustomDCFResult } from "@/types/ai-analysis/dcfTypes";

/**
 * Generate projected data from DCF results
 */
export const createProjectedData = (
  apiResults: any[], 
  params: any = {}
): YearlyDCFData[] => {
  if (!apiResults || apiResults.length === 0) {
    return [];
  }

  return apiResults.map(item => ({
    year: item.year || new Date().getFullYear().toString(),
    revenue: item.revenue || 0,
    ebit: item.ebit || 0,
    ebitda: item.ebitda || 0,
    freeCashFlow: item.freeCashFlow || 0,
    operatingCashFlow: item.operatingCashFlow || 0,
    capitalExpenditure: item.capitalExpenditure || 0
  }));
};

/**
 * Create a default DCF result from API data
 */
export const createDefaultDCFResult = (
  symbol: string, 
  apiResults: any[]
): CustomDCFResult => {
  // Use the first result as the primary result
  const result = apiResults[0] || {};
  
  return {
    year: result.year || new Date().getFullYear().toString(),
    symbol: symbol,
    revenue: result.revenue || 0,
    revenuePercentage: result.revenuePercentage || 0,
    ebitda: result.ebitda || 0,
    ebitdaPercentage: result.ebitdaPercentage || 0,
    ebit: result.ebit || 0,
    ebitPercentage: result.ebitPercentage || 0,
    depreciation: result.depreciation || 0,
    capitalExpenditure: result.capitalExpenditure || 0,
    capitalExpenditurePercentage: result.capitalExpenditurePercentage || 0,
    price: result.price || 0,
    beta: result.beta || 0,
    dilutedSharesOutstanding: result.dilutedSharesOutstanding || 0,
    costofDebt: result.costofDebt || 0,
    taxRate: result.taxRate || 0,
    afterTaxCostOfDebt: result.afterTaxCostOfDebt || 0,
    riskFreeRate: result.riskFreeRate || 0,
    marketRiskPremium: result.marketRiskPremium || 0,
    costOfEquity: result.costOfEquity || 0,
    totalDebt: result.totalDebt || 0,
    totalEquity: result.totalEquity || 0,
    totalCapital: result.totalCapital || 0,
    debtWeighting: result.debtWeighting || 0,
    equityWeighting: result.equityWeighting || 0,
    wacc: result.wacc || 0,
    operatingCashFlow: result.operatingCashFlow || 0,
    pvLfcf: result.pvLfcf || 0,
    sumPvLfcf: result.sumPvLfcf || 0,
    longTermGrowthRate: result.longTermGrowthRate || 0,
    freeCashFlow: result.freeCashFlow || 0,
    terminalValue: result.terminalValue || 0,
    presentTerminalValue: result.presentTerminalValue || 0,
    enterpriseValue: result.enterpriseValue || 0,
    netDebt: result.netDebt || 0,
    equityValue: result.equityValue || 0,
    equityValuePerShare: result.equityValuePerShare || 0,
    freeCashFlowT1: result.freeCashFlowT1 || 0,
    operatingCashFlowPercentage: result.operatingCashFlowPercentage || 0,
    cashAndCashEquivalents: result.cashAndCashEquivalents || 0
  };
};

/**
 * Handle DCF API errors consistently
 */
export const handleDCFError = async (
  error: any, 
  fallbackFunction?: () => Promise<any>,
  operation: string = "DCF operation"
): Promise<any> => {
  console.error(`Error in ${operation}:`, error);
  
  // If a fallback function is provided, try to use it
  if (fallbackFunction) {
    try {
      console.log(`Attempting fallback for ${operation}`);
      return await fallbackFunction();
    } catch (fallbackError) {
      console.error(`Fallback for ${operation} also failed:`, fallbackError);
      return null;
    }
  }
  
  return null;
};

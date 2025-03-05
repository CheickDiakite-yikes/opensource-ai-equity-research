
import { CustomDCFParams, CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { toast } from "@/components/ui/use-toast";

/**
 * Transform API result into projected yearly data
 */
export const createProjectedData = (
  result: any[], 
  params?: CustomDCFParams
): YearlyDCFData[] => {
  const currentYear = new Date().getFullYear();
  const projectionYears = Array.from({length: 5}, (_, i) => currentYear + i);
  
  // If we have multiple years in the result, use them directly
  if (result.length > 1) {
    // API returned multiple years of data
    const yearly = result.map(item => ({
      year: item.year,
      revenue: item.revenue || 0,
      ebit: item.ebit || 0,
      ebitda: item.ebitda || 0,
      freeCashFlow: item.freeCashFlow || (item.operatingCashFlow ? item.operatingCashFlow - Math.abs(item.capitalExpenditure || 0) : 0),
      operatingCashFlow: item.operatingCashFlow || 0,
      capitalExpenditure: item.capitalExpenditure || 0
    }));
    
    // Sort the projections by year (ascending)
    return yearly.sort((a, b) => {
      const yearA = parseInt(a.year);
      const yearB = parseInt(b.year);
      return yearA - yearB;
    });
  } 
  
  // Only single year data, project for next years
  const baseItem = result[0];
  const revenueGrowth = params?.revenueGrowthPct || 
    (baseItem.revenuePercentage ? baseItem.revenuePercentage / 100 : 0.085);
  
  return projectionYears.map((year, index) => {
    const growthFactor = Math.pow(1 + revenueGrowth, index);
    return {
      year: year.toString(),
      revenue: (baseItem.revenue || 0) * growthFactor,
      ebit: (baseItem.ebit || 0) * growthFactor,
      ebitda: (baseItem.ebitda || 0) * growthFactor,
      freeCashFlow: (baseItem.freeCashFlow || 0) * growthFactor,
      operatingCashFlow: (baseItem.operatingCashFlow || 0) * growthFactor,
      capitalExpenditure: (baseItem.capitalExpenditure || 0) * growthFactor
    };
  });
};

/**
 * Create default DCF result structure with fallback values
 */
export const createDefaultDCFResult = (symbol: string, data?: any): CustomDCFResult => {
  const baseItem = data && data.length > 0 ? data[0] : {};
  
  return {
    year: new Date().getFullYear().toString(),
    symbol: symbol,
    revenue: baseItem.revenue || 0,
    revenuePercentage: 8.5,
    ebitda: baseItem.ebitda || 0,
    ebitdaPercentage: 31.27,
    ebit: baseItem.ebit || 0,
    ebitPercentage: 27.81,
    depreciation: baseItem.depreciation || 0,
    capitalExpenditure: baseItem.capitalExpenditure || 0,
    capitalExpenditurePercentage: 3.06,
    price: baseItem["Stock Price"] || 0,
    beta: 1.244,
    dilutedSharesOutstanding: baseItem.dilutedSharesOutstanding || 0,
    costofDebt: 0.0364,
    taxRate: 0.21,
    afterTaxCostOfDebt: 0.0364 * (1 - 0.21),
    riskFreeRate: 0.0364,
    marketRiskPremium: 0.0472,
    costOfEquity: 0.0951,
    totalDebt: baseItem.totalDebt || 0,
    totalEquity: baseItem.totalEquity || 0,
    totalCapital: (baseItem.totalDebt || 0) + (baseItem.totalEquity || 0),
    debtWeighting: 0.3,
    equityWeighting: 0.7,
    wacc: 0.095,
    operatingCashFlow: baseItem.operatingCashFlow || 0,
    pvLfcf: 0,
    sumPvLfcf: 0,
    longTermGrowthRate: 0.03,
    freeCashFlow: baseItem.freeCashFlow || 0,
    terminalValue: 0,
    presentTerminalValue: 0,
    enterpriseValue: 0,
    netDebt: baseItem.netDebt || 0,
    equityValue: 0,
    equityValuePerShare: baseItem.dcf || 0,
    freeCashFlowT1: 0,
    operatingCashFlowPercentage: 28.86,
    cashAndCashEquivalents: baseItem.cashAndCashEquivalents || 0  // Add the missing property
  };
};

/**
 * Handle DCF calculation errors with appropriate fallback and user feedback
 */
export const handleDCFError = async (
  err: any, 
  fallbackFn?: () => Promise<any>, 
  errorContext?: string
) => {
  console.error(`Error ${errorContext || 'calculating DCF'}:`, err);
  
  if (fallbackFn) {
    try {
      toast({
        title: "Trying alternative calculation",
        description: `${errorContext || 'DCF calculation'} failed. Attempting fallback method.`,
      });
      
      return await fallbackFn();
    } catch (fallbackErr) {
      console.error("Fallback calculation also failed:", fallbackErr);
      return null;
    }
  }
  
  return null;
};

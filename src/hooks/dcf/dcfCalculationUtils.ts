
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
  if (result && Array.isArray(result) && result.length > 1) {
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
  
  // Only single year data or no data, project for next years
  const baseItem = result && Array.isArray(result) && result.length > 0 ? result[0] : null;
  const revenueGrowth = params?.revenueGrowthPct || 
    (baseItem?.revenuePercentage ? baseItem.revenuePercentage / 100 : 0.085);
  
  // Generate default projections if no data available
  return projectionYears.map((year, index) => {
    const growthFactor = Math.pow(1 + revenueGrowth, index);
    const baseRevenue = baseItem?.revenue || 100000000;
    const baseEbit = baseItem?.ebit || baseRevenue * 0.25; 
    const baseEbitda = baseItem?.ebitda || baseEbit * 1.2;
    const baseFcf = baseItem?.freeCashFlow || baseEbit * 0.65;
    const baseOcf = baseItem?.operatingCashFlow || baseFcf * 1.2;
    const baseCapex = baseItem?.capitalExpenditure || baseRevenue * 0.08;
    
    return {
      year: year.toString(),
      revenue: baseRevenue * growthFactor,
      ebit: baseEbit * growthFactor,
      ebitda: baseEbitda * growthFactor,
      freeCashFlow: baseFcf * growthFactor,
      operatingCashFlow: baseOcf * growthFactor,
      capitalExpenditure: baseCapex * growthFactor
    };
  });
};

/**
 * Create default DCF result structure with fallback values
 */
export const createDefaultDCFResult = (symbol: string, data?: any[]): CustomDCFResult => {
  const baseItem = data && Array.isArray(data) && data.length > 0 ? data[0] : {};
  
  return {
    year: new Date().getFullYear().toString(),
    symbol: symbol,
    revenue: baseItem.revenue || 100000000,
    revenuePercentage: baseItem.revenuePercentage || 8.5,
    ebitda: baseItem.ebitda || 30000000,
    ebitdaPercentage: baseItem.ebitdaPercentage || 31.27,
    ebit: baseItem.ebit || 25000000,
    ebitPercentage: baseItem.ebitPercentage || 27.81,
    depreciation: baseItem.depreciation || 5000000,
    capitalExpenditure: baseItem.capitalExpenditure || 8000000,
    capitalExpenditurePercentage: baseItem.capitalExpenditurePercentage || 3.06,
    price: baseItem.price || 100,
    beta: baseItem.beta || 1.244,
    dilutedSharesOutstanding: baseItem.dilutedSharesOutstanding || 1000000,
    costofDebt: baseItem.costofDebt || 0.0364,
    taxRate: baseItem.taxRate || 0.21,
    afterTaxCostOfDebt: baseItem.afterTaxCostOfDebt || (0.0364 * (1 - 0.21)),
    riskFreeRate: baseItem.riskFreeRate || 0.0364,
    marketRiskPremium: baseItem.marketRiskPremium || 0.0472,
    costOfEquity: baseItem.costOfEquity || 0.0951,
    totalDebt: baseItem.totalDebt || 30000000,
    totalEquity: baseItem.totalEquity || 70000000,
    totalCapital: baseItem.totalCapital || 100000000,
    debtWeighting: baseItem.debtWeighting || 0.3,
    equityWeighting: baseItem.equityWeighting || 0.7,
    wacc: baseItem.wacc || 0.095,
    operatingCashFlow: baseItem.operatingCashFlow || 20000000,
    pvLfcf: baseItem.pvLfcf || 0,
    sumPvLfcf: baseItem.sumPvLfcf || 0,
    longTermGrowthRate: baseItem.longTermGrowthRate || 0.03,
    freeCashFlow: baseItem.freeCashFlow || 15000000,
    terminalValue: baseItem.terminalValue || 375000000,
    presentTerminalValue: baseItem.presentTerminalValue || 0,
    enterpriseValue: baseItem.enterpriseValue || 150000000,
    netDebt: baseItem.netDebt || 10000000,
    equityValue: baseItem.equityValue || 140000000,
    equityValuePerShare: baseItem.equityValuePerShare || baseItem.dcf || 115,
    freeCashFlowT1: baseItem.freeCashFlowT1 || 0,
    operatingCashFlowPercentage: baseItem.operatingCashFlowPercentage || 28.86,
    cashAndCashEquivalents: baseItem.cashAndCashEquivalents || 20000000
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
        description: `${errorContext || 'DCF calculation'} failed. Using fallback method.`,
      });
      
      return await fallbackFn();
    } catch (fallbackErr) {
      console.error("Fallback calculation also failed:", fallbackErr);
      toast({
        title: "Using estimated values",
        description: "Unable to calculate precise DCF valuation. Using estimated values based on typical assumptions.",
        variant: "destructive",
      });
      return null;
    }
  }
  
  toast({
    title: "Using estimated values",
    description: "Unable to calculate precise DCF valuation. Using estimated values based on typical assumptions.",
    variant: "destructive",
  });
  
  return null;
};

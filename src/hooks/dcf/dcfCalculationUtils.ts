
import { CustomDCFParams, CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { toast } from "@/components/ui/use-toast";

/**
 * Transform API result into projected yearly data
 */
export const createProjectedData = (
  result: any[], 
  params?: CustomDCFParams
): YearlyDCFData[] => {
  // If we have multiple years in the result, use them directly
  if (result && Array.isArray(result) && result.length > 1) {
    // API returned multiple years of data
    const yearly = result.map(item => ({
      year: item.year || new Date().getFullYear().toString(),
      revenue: item.revenue || 0,
      ebit: item.ebit || 0,
      ebitda: item.ebitda || 0,
      freeCashFlow: item.freeCashFlow || item.ufcf || (item.operatingCashFlow ? item.operatingCashFlow - Math.abs(item.capitalExpenditure || 0) : 0),
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
  const currentYear = new Date().getFullYear();
  const projectionYears = Array.from({length: 5}, (_, i) => currentYear + i);
  const baseItem = result && Array.isArray(result) && result.length > 0 ? result[0] : null;
  const revenueGrowth = params?.revenueGrowthPct || 
    (baseItem?.revenuePercentage ? baseItem.revenuePercentage / 100 : 0.085);
  
  // Generate default projections if no data available
  return projectionYears.map((year, index) => {
    const growthFactor = Math.pow(1 + revenueGrowth, index);
    const baseRevenue = baseItem?.revenue || 100000000;
    const baseEbit = baseItem?.ebit || baseRevenue * 0.25; 
    const baseEbitda = baseItem?.ebitda || baseEbit * 1.2;
    const baseFcf = baseItem?.freeCashFlow || baseItem?.ufcf || baseEbit * 0.65;
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

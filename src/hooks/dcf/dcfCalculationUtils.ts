
import { CustomDCFParams, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
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
  
  // We only have one year data, generate additional years
  const baseItem = result && Array.isArray(result) && result.length > 0 ? result[0] : null;
  if (!baseItem) {
    return generateDefaultProjections();
  }
  
  // Generate projections based on the single year data
  const currentYear = baseItem.year ? parseInt(baseItem.year) : new Date().getFullYear();
  const projectionYears = Array.from({length: 5}, (_, i) => currentYear + i);
  const revenueGrowth = params?.revenueGrowthPct || 
    (baseItem?.revenuePercentage ? baseItem.revenuePercentage / 100 : 0.085);
  
  // Generate projections based on base item
  return projectionYears.map((year, index) => {
    const growthFactor = Math.pow(1 + revenueGrowth, index);
    const baseRevenue = baseItem?.revenue || 394328000000;
    const baseEbit = baseItem?.ebit || baseRevenue * 0.30; 
    const baseEbitda = baseItem?.ebitda || baseEbit * 1.2;
    const baseFcf = baseItem?.freeCashFlow || baseItem?.ufcf || baseEbit * 0.80;
    const baseOcf = baseItem?.operatingCashFlow || baseFcf * 1.2;
    const baseCapex = baseItem?.capitalExpenditure || baseRevenue * 0.03;
    
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
 * Generate default projections if no data is available
 */
const generateDefaultProjections = (): YearlyDCFData[] => {
  const currentYear = new Date().getFullYear();
  const results: YearlyDCFData[] = [];
  
  for (let i = 0; i < 5; i++) {
    const year = currentYear + i;
    const growthFactor = Math.pow(1.085, i);
    
    results.push({
      year: year.toString(),
      revenue: 394328000000 * growthFactor, // Apple baseline revenue
      ebit: 119437000000 * growthFactor,
      ebitda: 139437000000 * growthFactor,
      freeCashFlow: 99766000000 * growthFactor,
      operatingCashFlow: 118879000000 * growthFactor,
      capitalExpenditure: 11322000000 * growthFactor
    });
  }
  
  return results;
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

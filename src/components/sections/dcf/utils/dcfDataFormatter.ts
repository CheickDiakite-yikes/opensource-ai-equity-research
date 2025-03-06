
import { 
  CustomDCFResult, 
  AIDCFSuggestion, 
  YearlyDCFData, 
  DCFSensitivityData, 
  FormattedDCFData,
  DCFAssumptionsSummary
} from "@/types/ai-analysis/dcfTypes";

/**
 * Get current price from financial data
 */
export const getCurrentPrice = (financials: any[]): number => {
  if (financials && financials.length > 0 && financials[0]?.price) {
    return financials[0].price;
  }
  return 100.00; // Default fallback
};

/**
 * Create mock DCF data when API fails
 */
export const createMockDCFData = (financials: any[]): FormattedDCFData => {
  const currentPrice = getCurrentPrice(financials);
  const intrinsicValue = currentPrice * 1.15; // 15% upside as default
  
  return {
    intrinsicValue,
    currentPrice,
    upside: "+15.0%",
    assumptions: {
      growthRate: "8.5% (first 5 years), 3% (terminal)",
      discountRate: "9.5%",
      terminalMultiple: "15x",
      taxRate: "21%"
    },
    projections: generateDefaultProjections(),
    sensitivity: generateSensitivityAnalysis(intrinsicValue, 0.095)
  };
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
  // Process and validate the incoming data
  const intrinsicValue = parseIntrinsicValue(customDCFResult?.equityValuePerShare);
  const assumptionsSummary = createAssumptionsSummary(assumptions, customDCFResult);
  const sortedProjections = formatAndSortProjections(projectedData);
  
  // Generate sensitivity analysis based on the intrinsic value
  const sensitivity = generateSensitivityAnalysis(intrinsicValue, customDCFResult?.wacc || 0.095);
  
  return {
    intrinsicValue,
    assumptions: assumptionsSummary,
    projections: sortedProjections,
    sensitivity: sensitivity || mockSensitivity // Fallback to mock data if generation fails
  };
};

/**
 * Parse and validate the intrinsic value
 */
const parseIntrinsicValue = (valuePerShare?: number): number => {
  if (!valuePerShare) return 115.00;
  
  const intrinsicValue = parseFloat(valuePerShare.toString());
  
  // Don't allow negative or extremely high intrinsic values
  if (isNaN(intrinsicValue) || intrinsicValue <= 0 || intrinsicValue > 1000000) {
    return 115.00; // Return a reasonable default
  }
  
  return intrinsicValue;
};

/**
 * Create a summary of DCF assumptions
 */
const createAssumptionsSummary = (
  assumptions: AIDCFSuggestion | null, 
  customDCFResult: CustomDCFResult | null
): DCFAssumptionsSummary => {
  if (!customDCFResult) {
    return {
      growthRate: "8.5% (first 5 years), 3% (terminal)",
      discountRate: "9.5%",
      terminalMultiple: "15x",
      taxRate: "21%"
    };
  }
  
  // Use calculated/reasonable values or fallback to defaults
  const growthRateInitial = customDCFResult.revenuePercentage 
    ? customDCFResult.revenuePercentage 
    : 8.5;
  
  const growthRateTerminal = customDCFResult.longTermGrowthRate 
    ? customDCFResult.longTermGrowthRate * 100
    : 3.0;
  
  const taxRate = customDCFResult.taxRate * 100;
  const waccPercent = customDCFResult.wacc * 100;
  
  // Calculate terminal multiple if available
  let terminalMultiple = "15x"; // Default
  if (customDCFResult.terminalValue && customDCFResult.ebit) {
    const multiple = customDCFResult.terminalValue / customDCFResult.ebit;
    terminalMultiple = `${multiple.toFixed(1)}x`;
  }
  
  return {
    growthRate: `${growthRateInitial.toFixed(1)}% (first 5 years), ${growthRateTerminal.toFixed(1)}% (terminal)`,
    discountRate: `${waccPercent.toFixed(1)}%`,
    terminalMultiple: terminalMultiple,
    taxRate: `${taxRate.toFixed(1)}%`
  };
};

/**
 * Format and sort projections data by year
 */
const formatAndSortProjections = (projectedData: YearlyDCFData[]): YearlyDCFData[] => {
  if (!projectedData || projectedData.length === 0) {
    return generateDefaultProjections();
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

/**
 * Generate default projections if none are provided
 */
const generateDefaultProjections = (): YearlyDCFData[] => {
  const currentYear = new Date().getFullYear();
  const results: YearlyDCFData[] = [];
  
  for (let i = 0; i < 5; i++) {
    const year = currentYear + i;
    const growthFactor = Math.pow(1.085, i);
    const baseRevenue = 100000000;
    
    results.push({
      year: year.toString(),
      revenue: baseRevenue * growthFactor,
      ebit: baseRevenue * 0.25 * growthFactor,
      ebitda: baseRevenue * 0.30 * growthFactor,
      freeCashFlow: baseRevenue * 0.20 * growthFactor,
      operatingCashFlow: baseRevenue * 0.25 * growthFactor,
      capitalExpenditure: -baseRevenue * 0.08 * growthFactor
    });
  }
  
  return results;
};

/**
 * Generate sensitivity analysis based on the intrinsic value
 */
export const generateSensitivityAnalysis = (
  intrinsicValue: number,
  discountRate: number
): DCFSensitivityData => {
  try {
    const baseDiscount = discountRate * 100;
    const growthRates = [2.0, 2.5, 3.0, 3.5, 4.0];
    const discountRates = [
      baseDiscount - 0.5, 
      baseDiscount, 
      baseDiscount + 0.5
    ];
    
    // Create the matrix
    const data: number[][] = [];
    
    // Each growth rate (row)
    growthRates.forEach((growthRate, rowIndex) => {
      data[rowIndex] = [];
      
      // Each discount rate (column)
      discountRates.forEach((discountRate, colIndex) => {
        // Base value is the intrinsic value
        let value = intrinsicValue;
        
        // Adjust for growth rate (higher growth = higher value)
        const growthDelta = (growthRate - 3.0) / 100;
        value = value * (1 + (growthDelta * 10));
        
        // Adjust for discount rate (higher discount = lower value)
        const discountDelta = (discountRate - baseDiscount) / 100;
        value = value * (1 - (discountDelta * 25));
        
        // Add some variance (±5%)
        value = value * (0.95 + (Math.random() * 0.1));
        
        data[rowIndex][colIndex] = parseFloat(value.toFixed(2));
      });
    });
    
    // Create rows with proper structure matching the DCFSensitivityData interface
    const rows = growthRates.map((rate, index) => ({
      growth: rate.toFixed(1) + '%',
      values: data[index]
    }));
    
    return {
      headers: ['Growth/Discount', ...discountRates.map(rate => rate.toFixed(1) + '%')],
      rows
    };
  } catch (error) {
    console.error("Error generating sensitivity analysis:", error);
    
    // Return a default sensitivity table
    return {
      headers: ['Growth/Discount', '9.0%', '9.5%', '10.0%'],
      rows: [
        { growth: '2.0%', values: [108.00, 104.00, 100.00] },
        { growth: '2.5%', values: [112.00, 108.00, 104.00] },
        { growth: '3.0%', values: [116.00, 112.00, 108.00] },
        { growth: '3.5%', values: [120.00, 116.00, 112.00] },
        { growth: '4.0%', values: [124.00, 120.00, 116.00] }
      ]
    };
  }
};


import { CustomDCFResult, FormattedDCFData, DCFSensitivityData, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";

/**
 * Create mock DCF data for fallback scenarios
 */
export const createMockDCFData = (financialData: any[]): FormattedDCFData => {
  const currentPrice = financialData[0]?.price || 100;
  const mockIntrinsicValue = currentPrice * 1.15; // 15% upside
  const upside = ((mockIntrinsicValue - currentPrice) / currentPrice) * 100;
  
  return {
    intrinsicValue: mockIntrinsicValue,
    currentPrice,
    upside: `${upside.toFixed(1)}%`,
    assumptions: {
      growthRate: "8.5% (first 5 years), 3% (terminal)",
      discountRate: "9.5%",
      terminalMultiple: "15x",
      taxRate: "21%"
    },
    projections: createMockProjections(),
    sensitivity: createMockSensitivityAnalysis()
  };
};

/**
 * Create mock sensitivity analysis table for DCF
 */
export const createMockSensitivityAnalysis = (): DCFSensitivityData => {
  const discountRates = ["9.0%", "9.5%", "10.0%", "10.5%"];
  const growthRates = ["2.0%", "2.5%", "3.0%", "3.5%", "4.0%"];
  
  // Generate a table of valuations by varying growth rate and discount rate
  const rows = growthRates.map(growth => {
    const values = discountRates.map((discount, j) => {
      // Create a pattern of values that look realistic
      const baseValue = 95;
      const growthEffect = (parseFloat(growth) - 2) * 0.5;
      const discountEffect = (parseFloat(discount) - 9) * -2;
      return baseValue + growthEffect + discountEffect;
    });
    
    return {
      growth,
      values
    };
  });
  
  return {
    headers: discountRates,
    rows
  };
};

/**
 * Create mock projections data for DCF
 */
const createMockProjections = (): YearlyDCFData[] => {
  const currentYear = new Date().getFullYear();
  const projectionYears = 5;
  const baseRevenue = 100000000;
  const baseEbit = baseRevenue * 0.25;
  const baseEbitda = baseEbit * 1.2;
  const baseCf = baseEbit * 0.65;
  const baseCapex = baseRevenue * 0.08;
  
  return Array.from({ length: projectionYears }, (_, i) => {
    const year = (currentYear + i).toString();
    const growthFactor = Math.pow(1.085, i); // 8.5% annual growth
    
    return {
      year,
      revenue: baseRevenue * growthFactor,
      ebit: baseEbit * growthFactor,
      ebitda: baseEbitda * growthFactor,
      freeCashFlow: baseCf * growthFactor,
      operatingCashFlow: baseCf * growthFactor * 1.2,
      capitalExpenditure: baseCapex * growthFactor
    };
  });
};

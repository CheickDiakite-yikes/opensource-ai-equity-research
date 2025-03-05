
import { 
  CustomDCFResult, 
  AIDCFSuggestion, 
  YearlyDCFData, 
  DCFSensitivityData, 
  FormattedDCFData,
  DCFAssumptionsSummary
} from "@/types/ai-analysis/dcfTypes";
import { createMockSensitivityAnalysis } from "./mockDCFGenerator";

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
const parseIntrinsicValue = (valuePerShare?: number): number => {
  if (!valuePerShare) return 100;
  
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
  customDCFResult: CustomDCFResult | null
): DCFAssumptionsSummary => {
  if (!customDCFResult) {
    return {
      growthRate: "8.5% (first 5 years), 3% (terminal)",
      discountRate: "9.5%",
      terminalMultiple: "DCF Model",
      taxRate: "21%"
    };
  }
  
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

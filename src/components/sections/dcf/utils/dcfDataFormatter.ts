
// Placeholder DCF data formatter
// This file contains stub functions to fix TypeScript errors after DCF feature removal

import { 
  CustomDCFResult, 
  AIDCFSuggestion, 
  YearlyDCFData, 
  FormattedDCFData,
  DCFSensitivityData 
} from "@/types/ai-analysis/dcfTypes";

/**
 * Prepare DCF data for display (stub function)
 */
export const prepareDCFData = (
  dcfResult: CustomDCFResult | null,
  assumptions: AIDCFSuggestion | null,
  projectedData: YearlyDCFData[],
  sensitivityData: DCFSensitivityData
): FormattedDCFData => {
  console.warn("DCF feature has been removed - stub function called");
  
  return {
    intrinsicValue: 0,
    currentPrice: 0,
    upside: "0%",
    assumptions: {
      growthRate: "0%",
      discountRate: "0%",
      terminalMultiple: "0x",
      taxRate: "0%"
    },
    projections: [],
    sensitivity: {
      headers: [],
      rows: []
    }
  };
};

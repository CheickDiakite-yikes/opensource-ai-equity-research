
import { CustomDCFParams } from "@/types/ai-analysis/dcfTypes";

/**
 * DCF Calculation Types
 */
export enum DCFType {
  STANDARD = "standard",
  LEVERED = "levered",
  CUSTOM_ADVANCED = "advanced",
  CUSTOM_LEVERED = "custom-levered"
}

/**
 * Format DCF parameters for API requests
 */
export const formatDCFParameters = (params: CustomDCFParams): Record<string, string> => {
  const formattedParams: Record<string, string> = {};

  // Map internal parameter names to FMP API parameters
  const paramMap: Record<string, string> = {
    revenueGrowthPct: 'revenueGrowth',
    ebitdaPct: 'ebitdaMargin',
    capitalExpenditurePct: 'capexPercent',
    taxRate: 'taxRate',
    longTermGrowthRate: 'longTermGrowthRate',
    costOfEquity: 'costOfEquity',
    costOfDebt: 'costofDebt', // Note: FMP API uses lowercase 'of' here
    marketRiskPremium: 'marketRiskPremium',
    riskFreeRate: 'riskFreeRate',
    beta: 'beta'
  };

  // Format each parameter
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Get the mapped parameter name, or use the original
      const apiParam = paramMap[key] || key;
      
      // Log parameter mapping for debugging
      console.log(`Mapping parameter ${key} to API param ${apiParam} with value ${value}`);
      
      formattedParams[apiParam] = String(value);
    }
  });

  return formattedParams;
};

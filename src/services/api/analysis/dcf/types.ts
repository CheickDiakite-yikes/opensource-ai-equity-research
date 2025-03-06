
/**
 * DCF Types Enum
 */
export enum DCFType {
  STANDARD = "standard",
  LEVERED = "levered",
  CUSTOM_ADVANCED = "advanced",
  CUSTOM_LEVERED = "custom-levered"
}

/**
 * DCF API Parameters interface
 */
export interface DCFApiParams {
  symbol: string;
  type: DCFType;
  params?: Record<string, any>;
  limit?: number;
}

/**
 * Format and validate DCF input parameters
 */
export const formatDCFParameters = (params: Record<string, any>): Record<string, any> => {
  // Format parameters for the FMP API
  const apiParams: Record<string, any> = { ...params };
  
  // Convert percentage values to decimals if needed
  const percentageKeys = [
    'longTermGrowthRate', 'costOfEquity', 'costOfDebt', 
    'marketRiskPremium', 'riskFreeRate'
  ];
  
  percentageKeys.forEach(key => {
    if (apiParams[key] !== undefined && apiParams[key] !== null) {
      // If value is provided as a percentage (e.g., 3.5 for 3.5%), convert to decimal (0.035)
      if (typeof apiParams[key] === 'number' && apiParams[key] > 0.2) {
        apiParams[key] = apiParams[key] / 100;
      }
    }
  });
  
  // Remove any undefined or null values to prevent API errors
  Object.keys(apiParams).forEach(key => {
    if (apiParams[key] === undefined || apiParams[key] === null || isNaN(apiParams[key])) {
      delete apiParams[key];
    }
  });
  
  return apiParams;
};


/**
 * DCF Types and reusable interfaces
 */

export enum DCFType {
  STANDARD = "standard",
  LEVERED = "levered",
  CUSTOM_BASIC = "basic",
  CUSTOM_ADVANCED = "advanced",
  CUSTOM_LEVERED = "custom-levered"
}

/**
 * Format DCF parameters for various API requests
 */
export const formatDCFParameters = (params: Record<string, any>): Record<string, any> => {
  const formattedParams: Record<string, any> = { ...params };
  
  // Convert percentage values to decimals for specific parameters
  ['longTermGrowthRate', 'costOfEquity', 'costOfDebt', 'marketRiskPremium', 'riskFreeRate'].forEach(key => {
    if (formattedParams[key] !== undefined && formattedParams[key] !== null) {
      // Convert from percentage to decimal if needed (e.g., 5% should be 0.05)
      if (typeof formattedParams[key] === 'number' && formattedParams[key] > 0.2) {
        formattedParams[key] = formattedParams[key] / 100;
      }
    }
  });
  
  return formattedParams;
};

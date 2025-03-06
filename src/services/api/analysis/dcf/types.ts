
export enum DCFType {
  STANDARD = "standard",
  LEVERED = "levered",
  CUSTOM_ADVANCED = "advanced",
  CUSTOM_LEVERED = "custom-levered"
}

/**
 * Format DCF parameters for API consumption
 */
export const formatDCFParameters = (params: any) => {
  // Deep copy the params to avoid modifying the original
  const formattedParams = { ...params };
  
  // Format rate parameters from percentage to decimal
  // These parameters need to be in decimal form for the API
  const percentageFields = [
    'longTermGrowthRate', 
    'costOfEquity', 
    'costOfDebt', 
    'marketRiskPremium', 
    'riskFreeRate'
  ];
  
  // Log original parameter values
  console.log("Original DCF parameters:", JSON.stringify(formattedParams, null, 2));
  
  // Convert percentage fields to decimals if needed
  for (const field of percentageFields) {
    if (formattedParams[field] !== undefined && formattedParams[field] !== null) {
      const val = parseFloat(formattedParams[field]);
      // If value is provided as percentage (e.g., 8.5), convert to decimal (0.085)
      if (!isNaN(val) && val > 0.2) {
        formattedParams[field] = (val / 100).toString();
        console.log(`Converting ${field} from ${val} to ${formattedParams[field]}`);
      }
    }
  }
  
  // Map parameter names to what the API expects
  const parameterMap: Record<string, string> = {
    revenueGrowthPct: 'revenuePercentage',
    ebitdaPct: 'ebitdaPercentage',
    capitalExpenditurePct: 'capitalExpenditurePercentage',
    taxRate: 'taxRate',
    beta: 'beta'
  };
  
  // Create a new object with the mapped parameter names
  const apiParams: Record<string, string> = {};
  
  // Copy values with parameter name mapping
  for (const [key, value] of Object.entries(formattedParams)) {
    if (value !== undefined && value !== null) {
      const apiKey = parameterMap[key] || key;
      apiParams[apiKey] = value.toString();
    }
  }
  
  // Log the formatted parameters
  console.log("Formatted DCF parameters for API:", JSON.stringify(apiParams, null, 2));
  
  return apiParams;
};

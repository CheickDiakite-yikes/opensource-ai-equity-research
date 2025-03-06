// Format parameters to be in proper decimal format for the FMP API
export const formatApiParams = (params: Record<string, any>): Record<string, string> => {
  const formattedParams: Record<string, string> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    // Special handling for rate parameters that need to be in decimal format
    if (key === 'longTermGrowthRate' || 
        key === 'costOfEquity' || 
        key === 'costOfDebt' || 
        key === 'marketRiskPremium' || 
        key === 'riskFreeRate') {
      // Ensure these are in decimal form (e.g., 0.04 not 4%)
      const numValue = parseFloat(String(value));
      // If the value is > 1, assume it's a percentage and convert to decimal
      const decimalValue = numValue > 1 ? numValue / 100 : numValue;
      formattedParams[key] = decimalValue.toString();
    } else {
      // For other parameters, keep as-is (already in proper decimal form)
      formattedParams[key] = String(value);
    }
  });
  
  return formattedParams;
};

// Build a URL with parameters for the FMP API
export const buildApiUrl = (baseUrl: string, params: Record<string, string>): string => {
  // If the URL already has a query parameter (contains '?'), use '&' to add more
  const separator = baseUrl.includes('?') ? '&' : '?';
  
  // Add each parameter to the URL
  let url = baseUrl;
  Object.entries(params).forEach(([key, value], index) => {
    if (value !== undefined && value !== null) {
      url += `${index === 0 ? separator : '&'}${key}=${value}`;
    }
  });
  
  return url;
};

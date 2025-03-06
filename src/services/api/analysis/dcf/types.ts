
export enum DCFType {
  STANDARD = "standard",
  LEVERED = "levered",
  CUSTOM_LEVERED = "custom-levered",
  CUSTOM_ADVANCED = "advanced"
}

/**
 * Format DCF parameters for the API request
 */
export const formatDCFParameters = (params: Record<string, any>): Record<string, any> => {
  // Format parameters for the FMP API
  const apiParams: Record<string, any> = {};
  
  // Convert to proper parameter names expected by FMP API
  const paramMap: Record<string, string> = {
    revenueGrowthPct: 'revenueGrowth',
    ebitdaPct: 'ebitdaMargin',
    capitalExpenditurePct: 'capexPercent',
    depreciationAndAmortizationPct: 'depreciationAndAmortizationPercent',
    cashAndShortTermInvestmentsPct: 'cashAndShortTermInvestmentsPercent',
    receivablesPct: 'receivablesPercent',
    inventoriesPct: 'inventoriesPercent',
    payablesPct: 'payablesPercent',
    ebitPct: 'ebitPercent',
    operatingCashFlowPct: 'operatingCashFlowPercent',
    sellingGeneralAndAdministrativeExpensesPct: 'sellingGeneralAndAdministrativeExpensesPercent'
  };
  
  // Map parameters with proper names
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const apiKey = paramMap[key] || key;
      
      // Convert percentage values to decimals if needed
      if (['longTermGrowthRate', 'costOfEquity', 'costOfDebt', 'marketRiskPremium', 'riskFreeRate'].includes(key)) {
        if (typeof value === 'number' && value > 0.2) {
          value = value / 100;
        }
      }
      
      apiParams[apiKey] = value;
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

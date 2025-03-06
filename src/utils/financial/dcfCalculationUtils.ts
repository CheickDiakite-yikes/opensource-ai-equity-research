
import { DCFInputs, CustomDCFResult } from "@/types/ai-analysis/dcfTypes";

export const calculateCustomDCF = async (symbol: string, customInputs?: Partial<DCFInputs>): Promise<Response> => {
  try {
    // Prepare the API request parameters
    const params = new URLSearchParams();
    params.append('symbol', symbol);
    
    // Add custom inputs if provided, with proper parameter naming for the FMP API
    if (customInputs) {
      // Map our internal property names to the expected FMP API parameter names
      const parameterMap: Record<string, string> = {
        revenuePercentage: 'revenueGrowthPct',
        ebitdaPercentage: 'ebitdaPct',
        capitalExpenditurePercentage: 'capitalExpenditurePct',
        taxRate: 'taxRate',
        longTermGrowthRate: 'longTermGrowthRate',
        costOfEquity: 'costOfEquity',
        costOfDebt: 'costOfDebt',
        marketRiskPremium: 'marketRiskPremium',
        riskFreeRate: 'riskFreeRate',
        beta: 'beta',
        // Additional mapping for other parameters
        depreciationAndAmortizationPercentage: 'depreciationAndAmortizationPct',
        cashAndShortTermInvestmentsPercentage: 'cashAndShortTermInvestmentsPct',
        receivablesPercentage: 'receivablesPct',
        inventoriesPercentage: 'inventoriesPct',
        payablesPercentage: 'payablePct',
        ebitPercentage: 'ebitPct',
        operatingCashFlowPercentage: 'operatingCashFlowPct',
        sellingGeneralAndAdministrativeExpensesPercentage: 'sellingGeneralAndAdministrativeExpensesPct'
      };
      
      Object.entries(customInputs).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Use the mapped parameter name if available, otherwise use the original key
          const paramName = parameterMap[key] || key;
          
          // Convert from percentages to decimal if needed
          if (key === 'longTermGrowthRate' || 
              key === 'costOfEquity' || 
              key === 'costOfDebt' || 
              key === 'marketRiskPremium' || 
              key === 'riskFreeRate') {
            // These parameters need to be converted from percentages if they are in percentage format
            const numValue = typeof value === 'number' ? value : parseFloat(value.toString());
            // Check if the value is already in decimal form (less than 1.0) or needs conversion
            const decimalValue = numValue > 1 ? numValue / 100 : numValue;
            params.append(paramName, decimalValue.toString());
          } else {
            // For other parameters, pass them as-is
            params.append(paramName, value.toString());
          }
        }
      });
    }
    
    // Call the DCF API endpoint - use the correct stable API endpoint
    const apiUrl = `/api/dcf?${params.toString()}`;
    console.log("Calling DCF API with params:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DCF calculation failed with status: ${response.status}, Error: ${errorText}`);
      throw new Error(`DCF calculation failed with status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error("Error calculating DCF:", error);
    throw error;
  }
};


import { invokeSupabaseFunction } from "../../base";
import { CustomDCFParams, CustomDCFResult } from "@/types/ai-analysis/dcfTypes";
import { toast } from "@/components/ui/use-toast";
import { DCFType } from "./types";
import { transformDCFResponse } from "./dataTransformer";

/**
 * Format DCF parameters for the API request
 */
export const formatDCFParameters = (params: CustomDCFParams): Record<string, any> => {
  // Format parameters for the FMP API
  const apiParams: Record<string, any> = {
    // Convert to proper parameter names expected by FMP API
    revenueGrowth: params.revenueGrowthPct,
    ebitdaMargin: params.ebitdaPct,
    capexPercent: params.capitalExpenditurePct,
    taxRate: params.taxRate,
    depreciationAndAmortizationPercent: params.depreciationAndAmortizationPct,
    cashAndShortTermInvestmentsPercent: params.cashAndShortTermInvestmentsPct,
    receivablesPercent: params.receivablesPct,
    inventoriesPercent: params.inventoriesPct,
    payablesPercent: params.payablesPct,
    ebitPercent: params.ebitPct,
    operatingCashFlowPercent: params.operatingCashFlowPct,
    sellingGeneralAndAdministrativeExpensesPercent: params.sellingGeneralAndAdministrativeExpensesPct,
    longTermGrowthRate: params.longTermGrowthRate,
    costOfEquity: params.costOfEquity,
    costOfDebt: params.costOfDebt,
    marketRiskPremium: params.marketRiskPremium,
    riskFreeRate: params.riskFreeRate,
    beta: params.beta
  };
  
  // Remove any undefined or null values to prevent API errors
  Object.keys(apiParams).forEach(key => {
    if (apiParams[key] === undefined || apiParams[key] === null || isNaN(apiParams[key])) {
      delete apiParams[key];
    }
  });
  
  console.log("Formatted DCF parameters:", apiParams);
  return apiParams;
};

/**
 * Handle DCF API response validation
 */
const validateDCFResponse = (data: any, symbol: string): any => {
  // Check if we received an error object
  if (data && typeof data === 'object' && 'error' in data) {
    console.error("Error from DCF API:", data.error, data.details);
    throw new Error(data.details || data.error || "DCF calculation failed");
  }
  
  if (!Array.isArray(data)) {
    console.error("Unexpected data format from custom DCF API:", data);
    throw new Error("Invalid response format from DCF service");
  }
  
  // Empty array is a valid response from the API, but indicates no data was returned
  // We'll handle this case differently now - return a flag indicating we should try again
  if (data.length === 0) {
    console.warn(`Received empty array from DCF API for ${symbol}`);
    return { empty: true };
  }
  
  return data;
};

/**
 * Fetch custom DCF calculation based on user-defined parameters
 */
export const fetchCustomDCF = async (
  symbol: string, 
  params: CustomDCFParams, 
  type: DCFType = DCFType.CUSTOM_ADVANCED
): Promise<CustomDCFResult[]> => {
  try {
    console.log(`Fetching custom DCF for ${symbol} with params:`, params);
    
    // Format parameters for the API
    const apiParams = formatDCFParameters(params);
    
    // First attempt
    let data = await invokeSupabaseFunction<any>('get-custom-dcf', { 
      symbol, 
      params: apiParams,
      type
    });
    
    if (!data) {
      console.error("No data returned from custom DCF API");
      throw new Error("Failed to fetch DCF data");
    }
    
    // Validate the response
    const validatedData = validateDCFResponse(data, symbol);
    
    // If we got an empty result, try again with standard DCF type as fallback
    if (validatedData.empty) {
      console.log("Empty result received, trying standard DCF as fallback");
      
      // Try standard DCF as fallback
      data = await invokeSupabaseFunction<any>('get-custom-dcf', {
        symbol,
        type: DCFType.STANDARD
      });
      
      if (!data || data.length === 0) {
        throw new Error("Both custom and standard DCF calculations failed to return data");
      }
      
      console.log("Standard DCF fallback succeeded:", data);
    }
    
    console.log(`Received ${data.length} DCF records for ${symbol}`);
    
    // Transform the data to our application format
    return transformDCFResponse(data, symbol);
  } catch (error) {
    console.error("Error fetching custom DCF:", error);
    
    // Show a toast with the error
    toast({
      title: "DCF Calculation Error",
      description: error instanceof Error ? error.message : String(error),
      variant: "destructive",
    });
    
    throw error;
  }
};

/**
 * Fetch custom levered DCF calculation based on user-defined parameters
 */
export const fetchCustomLeveredDCF = async (
  symbol: string, 
  params: CustomDCFParams
): Promise<CustomDCFResult[]> => {
  try {
    return await fetchCustomDCF(symbol, params, DCFType.CUSTOM_LEVERED);
  } catch (error) {
    // If levered DCF fails, try standard as fallback
    console.log("Levered DCF failed, trying standard DCF as fallback");
    return fetchCustomDCF(symbol, params, DCFType.STANDARD);
  }
};


import { invokeSupabaseFunction } from "../../base";
import { CustomDCFParams, CustomDCFResult } from "@/types/ai-analysis/dcfTypes";
import { toast } from "@/components/ui/use-toast";
import { DCFType, formatDCFParameters } from "./types";
import { transformDCFResponse } from "./dataTransformer";

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
  if (data.length === 0) {
    console.warn(`Received empty array from DCF API for ${symbol}`);
    throw new Error("DCF calculation returned no data");
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
    
    const data = await invokeSupabaseFunction<any>('get-custom-dcf', { 
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
    
    console.log(`Received ${validatedData.length} DCF records for ${symbol}`);
    
    // Transform the data to our application format
    return transformDCFResponse(validatedData, symbol);
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
  return fetchCustomDCF(symbol, params, DCFType.CUSTOM_LEVERED);
};

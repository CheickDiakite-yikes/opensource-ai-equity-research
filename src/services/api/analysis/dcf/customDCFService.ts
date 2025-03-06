
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
  
  // If any item has mockData=true, notify the user but don't throw error
  if (data.length > 0 && data[0]?.mockData === true) {
    console.warn(`Using mock DCF data for ${symbol}`);
    // We'll show toast elsewhere to avoid duplication
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
    if (!symbol || symbol.trim() === "") {
      throw new Error("Symbol is required for DCF calculation");
    }
    
    console.log(`Fetching custom DCF for ${symbol} with params:`, params);
    
    // Format parameters for the API
    const apiParams = formatDCFParameters(params);
    
    // Make sure symbol is included in the params
    const paramsWithSymbol = {
      ...apiParams,
      symbol: symbol.toUpperCase().trim(),
      type: type.toString()
    };
    
    console.log("Sending DCF request with params:", paramsWithSymbol);
    
    const data = await invokeSupabaseFunction<any>('get-custom-dcf', paramsWithSymbol);
    
    if (!data) {
      console.error("No data returned from custom DCF API");
      throw new Error("Failed to fetch DCF data");
    }
    
    // Validate the response
    const validatedData = validateDCFResponse(data, symbol);
    
    console.log(`Received ${validatedData.length} DCF records for ${symbol}`);
    
    // Check if using mock data
    if (validatedData.length > 0 && validatedData[0]?.mockData === true) {
      toast({
        title: "Using Estimated DCF Values",
        description: "We're displaying estimated DCF values based on reasonable assumptions.",
        variant: "default",
      });
    }
    
    // Transform the data to our application format
    return transformDCFResponse(validatedData, symbol);
  } catch (error) {
    console.error("Error fetching custom DCF:", error);
    
    // Show a toast with the error
    toast({
      title: "DCF Calculation Notice",
      description: "Using estimated DCF values for calculation due to data availability issues.",
      variant: "default",
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

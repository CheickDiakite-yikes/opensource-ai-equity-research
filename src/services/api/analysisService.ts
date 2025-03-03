
import { invokeSupabaseFunction } from "./base";
import { CustomDCFParams, CustomDCFResult } from "@/types/aiAnalysisTypes";

/**
 * Fetch custom DCF calculation based on user-defined parameters
 */
export const fetchCustomDCF = async (symbol: string, params: CustomDCFParams): Promise<CustomDCFResult[]> => {
  try {
    console.log(`Fetching custom DCF for ${symbol} with params:`, params);
    
    const data = await invokeSupabaseFunction<CustomDCFResult[]>('get-custom-dcf', { 
      symbol, 
      params 
    });
    
    if (!data) {
      console.error("No data returned from custom DCF API");
      return [];
    }
    
    if (!Array.isArray(data)) {
      console.error("Unexpected data format from custom DCF API:", data);
      return [];
    }
    
    console.log(`Received ${data.length} DCF records for ${symbol}`);
    return data;
  } catch (error) {
    console.error("Error fetching custom DCF:", error);
    throw error;
  }
};


import { invokeSupabaseFunction } from "../../base";
import { DCFType } from "./types";

/**
 * Handle DCF API response validation
 */
const validateDCFResponse = (data: any, symbol: string, functionName: string): any => {
  console.log(`${functionName} - Validating response for ${symbol}:`, data);
  
  // Check if we received an error object
  if (data && typeof data === 'object' && 'error' in data) {
    console.error(`${functionName} - Error from DCF API:`, data.error, data.details);
    throw new Error(data.details || data.error || "DCF calculation failed");
  }
  
  if (!Array.isArray(data)) {
    console.error(`${functionName} - Unexpected data format:`, data);
    
    // Try to wrap non-array data in an array
    return [data];
  }
  
  if (data.length === 0) {
    console.error(`${functionName} - Empty array returned from API`);
    throw new Error("DCF calculation returned empty array");
  }
  
  return data;
};

/**
 * Fetch standard DCF calculation
 */
export const fetchStandardDCF = async (symbol: string): Promise<any> => {
  try {
    console.log(`fetchStandardDCF - Starting calculation for ${symbol}`);
    
    const data = await invokeSupabaseFunction('get-custom-dcf', { 
      symbol,
      type: DCFType.STANDARD
    });
    
    console.log(`fetchStandardDCF - Received raw response for ${symbol}:`, data);
    
    if (!data) {
      console.error("fetchStandardDCF - Empty response from API");
      throw new Error("Standard DCF calculation returned no data");
    }
    
    // Validate and process the response
    const validatedData = validateDCFResponse(data, symbol, "fetchStandardDCF");
    console.log(`fetchStandardDCF - Successfully validated data for ${symbol}`);
    
    return validatedData;
  } catch (error) {
    console.error("fetchStandardDCF - Error:", error);
    throw error;
  }
};

/**
 * Fetch levered DCF calculation
 */
export const fetchLeveredDCF = async (symbol: string, limit?: number): Promise<any> => {
  try {
    console.log(`fetchLeveredDCF - Starting calculation for ${symbol}`);
    
    const params: any = {};
    if (limit && !isNaN(limit)) {
      params.limit = limit;
    }
    
    console.log(`fetchLeveredDCF - Calling API with params:`, { symbol, type: DCFType.LEVERED, params });
    
    const data = await invokeSupabaseFunction('get-custom-dcf', { 
      symbol,
      type: DCFType.LEVERED,
      params
    });
    
    console.log(`fetchLeveredDCF - Received raw response for ${symbol}:`, data);
    
    if (!data) {
      console.error("fetchLeveredDCF - Empty response from API");
      throw new Error("Levered DCF calculation returned no data");
    }
    
    // Validate and process the response
    const validatedData = validateDCFResponse(data, symbol, "fetchLeveredDCF");
    console.log(`fetchLeveredDCF - Successfully validated data for ${symbol}`);
    
    return validatedData;
  } catch (error) {
    console.error("fetchLeveredDCF - Error:", error);
    throw error;
  }
};

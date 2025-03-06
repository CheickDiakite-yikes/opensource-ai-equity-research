
import { invokeSupabaseFunction } from "../../base";
import { DCFType } from "./types";

/**
 * Fetch standard DCF calculation
 */
export const fetchStandardDCF = async (symbol: string): Promise<any> => {
  try {
    console.log(`Fetching standard DCF for ${symbol}`);
    
    const data = await invokeSupabaseFunction('get-custom-dcf', { 
      symbol,
      type: DCFType.STANDARD
    });
    
    if (!data) {
      console.error("Empty response from standard DCF API");
      throw new Error("Standard DCF calculation returned no data");
    }
    
    if (!Array.isArray(data)) {
      console.error("Unexpected data format from standard DCF API:", data);
      
      // If we got an error object instead of an array
      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error(`API Error: ${data.error}`);
      }
      
      // Try to wrap non-array data in an array
      return [data];
    }
    
    if (data.length === 0) {
      console.error("Empty array returned from standard DCF API");
      throw new Error("Standard DCF calculation returned empty array");
    }
    
    console.log(`Successfully retrieved standard DCF data for ${symbol}:`, data);
    return data;
  } catch (error) {
    console.error("Error fetching standard DCF:", error);
    throw error;
  }
};

/**
 * Fetch levered DCF calculation using v4 advanced levered endpoint
 */
export const fetchLeveredDCF = async (symbol: string, limit?: number): Promise<any> => {
  try {
    console.log(`Fetching v4 advanced levered DCF for ${symbol}`);
    
    const params: any = {};
    if (limit && !isNaN(limit)) {
      params.limit = limit;
    }
    
    const data = await invokeSupabaseFunction('get-custom-dcf', { 
      symbol,
      type: DCFType.LEVERED,
      params
    });
    
    if (!data) {
      console.error("Empty response from levered DCF API");
      throw new Error("Levered DCF calculation returned no data");
    }
    
    if (!Array.isArray(data)) {
      console.error("Unexpected data format from levered DCF API:", data);
      
      // If we got an error object instead of an array
      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error(`API Error: ${data.error}`);
      }
      
      // Try to wrap non-array data in an array
      return [data];
    }
    
    if (data.length === 0) {
      console.error("Empty array returned from levered DCF API");
      throw new Error("Levered DCF calculation returned empty array");
    }
    
    console.log(`Successfully retrieved levered DCF data for ${symbol}:`, data);
    return data;
  } catch (error) {
    console.error("Error fetching levered DCF:", error);
    throw error;
  }
};

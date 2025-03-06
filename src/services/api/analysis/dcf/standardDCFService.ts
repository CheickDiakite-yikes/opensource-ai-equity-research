
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
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("Empty or invalid response from standard DCF API");
      throw new Error("Standard DCF calculation returned no data");
    }
    
    console.log(`Successfully retrieved standard DCF data for ${symbol}:`, data);
    return data;
  } catch (error) {
    console.error("Error fetching standard DCF:", error);
    throw error;
  }
};

/**
 * Fetch levered DCF calculation
 */
export const fetchLeveredDCF = async (symbol: string, limit?: number): Promise<any> => {
  try {
    console.log(`Fetching levered DCF for ${symbol}`);
    
    const params: any = {};
    if (limit && !isNaN(limit)) {
      params.limit = limit;
    }
    
    const data = await invokeSupabaseFunction('get-custom-dcf', { 
      symbol,
      type: DCFType.LEVERED,
      params
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("Empty or invalid response from levered DCF API");
      throw new Error("Levered DCF calculation returned no data");
    }
    
    console.log(`Successfully retrieved levered DCF data for ${symbol}:`, data);
    return data;
  } catch (error) {
    console.error("Error fetching levered DCF:", error);
    throw error;
  }
};

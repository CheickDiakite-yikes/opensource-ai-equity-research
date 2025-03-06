import { invokeSupabaseFunction } from "@/services/api/base";
import { DCFResponse, DCFType } from "./types";

/**
 * Fetch DCF (Discounted Cash Flow) valuation for a stock
 */
export const fetchDCF = async (symbol: string): Promise<DCFResponse | null> => {
  try {
    const data = await invokeSupabaseFunction<DCFResponse[]>('get-stock-data', { 
      symbol, 
      endpoint: 'dcf' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching DCF:", error);
    return null;
  }
};

/**
 * Fetch advanced DCF model with detailed assumptions
 */
export const fetchAdvancedDCF = async (symbol: string): Promise<any | null> => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-stock-data', { 
      symbol, 
      endpoint: 'advanced-dcf' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching advanced DCF:", error);
    return null;
  }
};

/**
 * Fetch levered DCF model
 */
export const fetchLeveredDCF = async (symbol: string): Promise<any | null> => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-stock-data', { 
      symbol, 
      endpoint: 'levered-dcf' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching levered DCF:", error);
    return null;
  }
};

/**
 * Calculate custom DCF with user-provided parameters
 */
export const calculateCustomDCF = async (
  symbol: string,
  params: {
    growthRate: number;
    terminalRate: number;
    discountRate: number;
    forecastYears: number;
    [key: string]: any;
  }
): Promise<any | null> => {
  try {
    const data = await invokeSupabaseFunction<any>('calculate-custom-dcf', { 
      symbol,
      params
    });
    
    return data;
  } catch (error) {
    console.error("Error calculating custom DCF:", error);
    return null;
  }
};

/**
 * Fetch DCF model based on type
 */
export const fetchDCFByType = async (
  symbol: string, 
  type: DCFType = DCFType.STANDARD
): Promise<any | null> => {
  try {
    switch (type) {
      case DCFType.STANDARD:
        return await fetchDCF(symbol);
      case DCFType.LEVERED:
        return await fetchLeveredDCF(symbol);
      case DCFType.CUSTOM_ADVANCED:
        return await fetchAdvancedDCF(symbol);
      default:
        return await fetchDCF(symbol);
    }
  } catch (error) {
    console.error(`Error fetching DCF of type ${type}:`, error);
    return null;
  }
};

/**
 * Process DCF API request
 */
export const processDCFRequest = async (request: Request): Promise<any> => {
  try {
    const { symbol, type = DCFType.STANDARD, params } = await request.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { status: 400 }
      );
    }
    
    let result;
    
    if (type === DCFType.CUSTOM_LEVERED && params) {
      result = await calculateCustomDCF(symbol, params);
    } else {
      result = await fetchDCFByType(symbol, type as DCFType);
    }
    
    if (!result) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch DCF data" }),
        { status: 404 }
      );
    }
    
    return new Response(
      JSON.stringify(result),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing DCF request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
};

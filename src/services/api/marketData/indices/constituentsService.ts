
import { invokeSupabaseFunction } from "../../base";
import { IndexConstituent } from "@/types/market/indexTypes";

/**
 * Fetch S&P 500 constituents
 */
export const fetchSP500Constituents = async (): Promise<IndexConstituent[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexConstituent[]>('get-stock-data', { 
      endpoint: 'sp500-constituents' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching S&P 500 constituents:", error);
    return [];
  }
};

/**
 * Fetch Nasdaq constituents
 */
export const fetchNasdaqConstituents = async (): Promise<IndexConstituent[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexConstituent[]>('get-stock-data', { 
      endpoint: 'nasdaq-constituents' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching Nasdaq constituents:", error);
    return [];
  }
};

/**
 * Fetch Dow Jones constituents
 */
export const fetchDowJonesConstituents = async (): Promise<IndexConstituent[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexConstituent[]>('get-stock-data', { 
      endpoint: 'dowjones-constituents' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching Dow Jones constituents:", error);
    return [];
  }
};

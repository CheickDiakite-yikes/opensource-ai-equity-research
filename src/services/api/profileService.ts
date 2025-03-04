
import { invokeSupabaseFunction } from "./base";
import { StockProfile, StockQuote, CompanyExecutive, ExecutiveCompensation } from "@/types";

/**
 * Fetch stock profile data
 */
export const fetchStockProfile = async (symbol: string): Promise<StockProfile | null> => {
  try {
    const data = await invokeSupabaseFunction<StockProfile[]>('get-stock-data', { 
      symbol, 
      endpoint: 'profile' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0] as StockProfile;
  } catch (error) {
    console.error("Error fetching stock profile:", error);
    return null;
  }
};

/**
 * Fetch stock quote data
 */
export const fetchStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  try {
    const data = await invokeSupabaseFunction<StockQuote[]>('get-stock-data', { 
      symbol, 
      endpoint: 'quote' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0] as StockQuote;
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return null;
  }
};

/**
 * Fetch stock rating data
 */
export const fetchStockRating = async (symbol: string): Promise<{ rating: string } | null> => {
  try {
    const data = await invokeSupabaseFunction<{ rating: string }[]>('get-stock-data', { 
      symbol, 
      endpoint: 'rating' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching stock rating:", error);
    return null;
  }
};

/**
 * Fetch company market cap data
 */
export const fetchMarketCap = async (symbol: string): Promise<{ marketCap: number, date: string } | null> => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-stock-data', { 
      symbol, 
      endpoint: 'market-cap' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching market cap:", error);
    return null;
  }
};

/**
 * Fetch historical market cap data
 */
export const fetchHistoricalMarketCap = async (symbol: string, limit: number = 100): Promise<any[]> => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-stock-data', { 
      symbol, 
      endpoint: 'historical-market-cap',
      limit
    });
    
    return data || [];
  } catch (error) {
    console.error("Error fetching historical market cap:", error);
    return [];
  }
};

/**
 * Fetch shares float data
 */
export const fetchSharesFloat = async (symbol: string): Promise<any | null> => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-stock-data', { 
      symbol, 
      endpoint: 'shares-float' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching shares float:", error);
    return null;
  }
};

/**
 * Fetch company executives data
 */
export const fetchCompanyExecutives = async (symbol: string): Promise<CompanyExecutive[]> => {
  try {
    const data = await invokeSupabaseFunction<CompanyExecutive[]>('get-stock-data', { 
      symbol, 
      endpoint: 'executives' 
    });
    
    return data || [];
  } catch (error) {
    console.error("Error fetching company executives:", error);
    return [];
  }
};

/**
 * Fetch executive compensation data
 */
export const fetchExecutiveCompensation = async (symbol: string): Promise<ExecutiveCompensation[]> => {
  try {
    const data = await invokeSupabaseFunction<ExecutiveCompensation[]>('get-stock-data', { 
      symbol, 
      endpoint: 'executive-compensation' 
    });
    
    return data || [];
  } catch (error) {
    console.error("Error fetching executive compensation:", error);
    return [];
  }
};

/**
 * Fetch company notes data
 */
export const fetchCompanyNotes = async (symbol: string): Promise<any[]> => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-stock-data', { 
      symbol, 
      endpoint: 'company-notes' 
    });
    
    return data || [];
  } catch (error) {
    console.error("Error fetching company notes:", error);
    return [];
  }
};

/**
 * Fetch employee count data
 */
export const fetchEmployeeCount = async (symbol: string): Promise<any | null> => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-stock-data', { 
      symbol, 
      endpoint: 'employee-count' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Error fetching employee count:", error);
    return null;
  }
};

/**
 * Fetch historical employee count data
 */
export const fetchHistoricalEmployeeCount = async (symbol: string): Promise<any[]> => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-stock-data', { 
      symbol, 
      endpoint: 'historical-employee-count' 
    });
    
    return data || [];
  } catch (error) {
    console.error("Error fetching historical employee count:", error);
    return [];
  }
};

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
    // Track retry attempts in this closure to limit retry loops
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts} to fetch stock quote for ${symbol}`);
        
        const data = await invokeSupabaseFunction<StockQuote[]>('get-stock-data', { 
          symbol, 
          endpoint: 'quote' 
        });
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.warn(`Empty quote data received for ${symbol}`);
          // If we got an empty array but no error, continue with retry
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            continue;
          }
          
          // Create placeholder on last attempt
          return createPlaceholderQuote(symbol);
        }
        
        return data[0] as StockQuote;
      } catch (err) {
        console.error(`Error on attempt ${attempts} fetching stock quote:`, err);
        
        // Only retry if we haven't hit max attempts
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          continue;
        }
        
        // Fallback to placeholder on final attempt failure
        return createPlaceholderQuote(symbol);
      }
    }
    
    // This should never be reached due to the returns in the loop
    return createPlaceholderQuote(symbol);
  } catch (error) {
    console.error("Outer error fetching stock quote:", error);
    return createPlaceholderQuote(symbol);
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
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { rating: "N/A" };
    }
    
    return data[0];
  } catch (error) {
    console.error("Error fetching stock rating:", error);
    return { rating: "N/A" };
  }
};

/**
 * Create a placeholder quote object for fallback when API fails
 */
const createPlaceholderQuote = (symbol: string): StockQuote => {
  return {
    symbol,
    name: `${symbol} (Data Unavailable)`,
    price: 0,
    change: 0,
    changesPercentage: 0,
    dayLow: 0,
    dayHigh: 0,
    yearHigh: 0,
    yearLow: 0,
    marketCap: 0,
    priceAvg50: 0,
    priceAvg200: 0,
    volume: 0,
    avgVolume: 0,
    exchange: "Unknown",
    open: 0,
    previousClose: 0,
    eps: 0,
    pe: 0,
    earningsAnnouncement: null,
    sharesOutstanding: 0,
    timestamp: 0
  };
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

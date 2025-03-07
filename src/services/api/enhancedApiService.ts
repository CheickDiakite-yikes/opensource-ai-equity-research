
import { invokeSupabaseFunction, withRetry } from "./base";
import { CACHE_EXPIRY } from "@/services/cache/cacheService";
import { toast } from "@/components/ui/use-toast";

/**
 * Enhanced API service with advanced caching, retry logic, 
 * and optimized data fetching strategies
 */

/**
 * Fetch financial data with optimized parallel requests
 */
export const fetchFinancialDataBundle = async (symbol: string) => {
  try {
    // Create a single cache key for the entire bundle
    const cacheKey = `financials:bundle:${symbol}`;
    
    // Define the fetcher function that executes parallel requests
    const fetcherFn = async () => {
      console.log(`Fetching financial data bundle for ${symbol}`);
      
      // Execute requests in parallel for better performance
      const [incomeData, balanceData, cashflowData, ratiosData] = await Promise.all([
        invokeSupabaseFunction("get-stock-data", {
          endpoint: "income-statement",
          symbol,
          period: "annual"
        }, { useCache: false }),
        invokeSupabaseFunction("get-stock-data", {
          endpoint: "balance-sheet-statement",
          symbol,
          period: "annual"
        }, { useCache: false }),
        invokeSupabaseFunction("get-stock-data", {
          endpoint: "cash-flow-statement",
          symbol,
          period: "annual"
        }, { useCache: false }),
        invokeSupabaseFunction("get-stock-data", {
          endpoint: "ratios",
          symbol,
          period: "annual"
        }, { useCache: false })
      ]);
      
      return {
        income: incomeData,
        balance: balanceData,
        cashflow: cashflowData,
        ratios: ratiosData
      };
    };
    
    // Use our enhanced caching mechanism
    return await invokeSupabaseFunction(
      "_dummy_", // Not actually used since we provide a custom fetcherFn
      {},
      {
        useCache: true,
        cacheKey,
        cacheTime: CACHE_EXPIRY.MEDIUM,
        retries: 2,
        fetcherFn // This will be used instead of invoking the function
      }
    );
  } catch (error) {
    console.error(`Error fetching financial data bundle for ${symbol}:`, error);
    toast({
      title: "Data Fetch Error",
      description: "Failed to load financial data. Please try again.",
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Fetch company profile and market data with optimized parallel requests
 */
export const fetchCompanyBundle = async (symbol: string) => {
  try {
    // Create a single cache key for the entire bundle
    const cacheKey = `company:bundle:${symbol}`;
    
    // Fetch data in parallel
    const fetcherFn = async () => {
      console.log(`Fetching company bundle for ${symbol}`);
      
      const [profile, quote, peers, news] = await Promise.all([
        invokeSupabaseFunction("get-stock-data", {
          endpoint: "profile",
          symbol
        }, { useCache: false }),
        invokeSupabaseFunction("get-stock-data", {
          endpoint: "quote",
          symbol
        }, { useCache: false }),
        invokeSupabaseFunction("get-stock-data", {
          endpoint: "peers",
          symbol
        }, { useCache: false }),
        invokeSupabaseFunction("get-finnhub-news", {
          symbol,
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        }, { useCache: false })
      ]);
      
      return {
        profile,
        quote,
        peers,
        news
      };
    };
    
    // Use enhanced caching with a moderate expiry time
    return await invokeSupabaseFunction(
      "_dummy_", // Not actually used
      {},
      {
        useCache: true,
        cacheKey,
        cacheTime: CACHE_EXPIRY.SHORT, // Market data changes frequently
        retries: 2,
        fetcherFn
      }
    );
  } catch (error) {
    console.error(`Error fetching company bundle for ${symbol}:`, error);
    toast({
      title: "Data Fetch Error",
      description: "Failed to load company data. Please try again.",
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Prefetch commonly needed data for a symbol
 * to improve perceived performance
 */
export const prefetchSymbolData = async (symbol: string): Promise<boolean> => {
  try {
    console.log(`Prefetching data for symbol: ${symbol}`);
    
    // Fire and forget - don't wait for completion
    Promise.all([
      fetchCompanyBundle(symbol).catch(e => console.error("Prefetch company bundle error:", e)),
      fetchFinancialDataBundle(symbol).catch(e => console.error("Prefetch financial data error:", e)),
      
      // Also trigger document caching in the background
      invokeSupabaseFunction("cache-company-documents", {
        symbol,
        docType: "all"
      }).catch(e => console.error("Prefetch document caching error:", e))
    ]);
    
    return true;
  } catch (error) {
    console.error(`Error in prefetchSymbolData for ${symbol}:`, error);
    return false;
  }
};

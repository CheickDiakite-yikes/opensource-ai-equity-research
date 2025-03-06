
import { cacheService } from '../cache/cacheService';
import { invokeSupabaseFunction, withRetry } from './core/edgeFunctions';
import { toast } from "sonner";

// Symbol-specific TTL values (in milliseconds)
const CACHE_TTL = {
  PROFILE: 24 * 60 * 60 * 1000, // 24 hours for company profile
  QUOTE: 5 * 60 * 1000,         // 5 minutes for stock quote
  FINANCIALS: 24 * 60 * 60 * 1000, // 24 hours for financial statements
  NEWS: 30 * 60 * 1000,         // 30 minutes for news
  DEFAULT: 15 * 60 * 1000       // 15 minutes default
};

// Request batching system
interface BatchedRequest<T> {
  symbol: string;
  endpoint: string;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
  params?: any;
}

class BatchManager {
  private static instance: BatchManager;
  private batchedRequests: Map<string, BatchedRequest<any>[]> = new Map();
  private batchTimeout: number | null = null;

  private constructor() {}

  public static getInstance(): BatchManager {
    if (!BatchManager.instance) {
      BatchManager.instance = new BatchManager();
    }
    return BatchManager.instance;
  }

  public addRequest<T>(batchKey: string, request: BatchedRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Add request to batch
      if (!this.batchedRequests.has(batchKey)) {
        this.batchedRequests.set(batchKey, []);
      }
      
      this.batchedRequests.get(batchKey)!.push({
        ...request,
        resolve,
        reject
      });

      // Set timeout to process batch
      if (this.batchTimeout === null) {
        this.batchTimeout = window.setTimeout(() => this.processBatches(), 50);
      }
    });
  }

  private async processBatches(): Promise<void> {
    this.batchTimeout = null;
    const batches = new Map(this.batchedRequests);
    this.batchedRequests.clear();

    // Process each batch
    for (const [batchKey, requests] of batches.entries()) {
      if (requests.length === 0) continue;

      try {
        // If batch has only one request, process normally
        if (requests.length === 1) {
          const req = requests[0];
          try {
            const data = await this.processSingleRequest(req.symbol, req.endpoint, req.params);
            req.resolve(data);
          } catch (error) {
            req.reject(error);
          }
          continue;
        }

        // For multiple requests, batch them
        const symbols = [...new Set(requests.map(r => r.symbol))];
        const endpoint = requests[0].endpoint; // Assuming same endpoint for a batch
        
        console.log(`Batching ${requests.length} requests for endpoint: ${endpoint}`);
        
        // Process batch request
        const batchedData = await this.processBatchRequest(symbols, endpoint);
        
        // Resolve individual requests
        for (const request of requests) {
          const data = batchedData.find(d => d.symbol === request.symbol);
          if (data) {
            request.resolve(data);
          } else {
            request.reject(new Error(`No data found for symbol ${request.symbol}`));
          }
        }
      } catch (error) {
        console.error(`Error processing batch ${batchKey}:`, error);
        // Reject all requests in this batch
        for (const request of requests) {
          request.reject(error);
        }
      }
    }
  }

  private async processSingleRequest(symbol: string, endpoint: string, params?: any): Promise<any> {
    const cacheKey = `${endpoint}:${symbol}:${JSON.stringify(params || {})}`;
    const cachedData = cacheService.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // Make the actual API call
    const data = await invokeSupabaseFunction('get-stock-data', { 
      symbol, 
      endpoint,
      ...params
    });
    
    // Determine appropriate TTL for this data type
    let ttl = CACHE_TTL.DEFAULT;
    if (endpoint === 'profile') ttl = CACHE_TTL.PROFILE;
    else if (endpoint === 'quote') ttl = CACHE_TTL.QUOTE;
    else if (['income-statement', 'balance-sheet', 'cash-flow', 'ratios'].includes(endpoint)) {
      ttl = CACHE_TTL.FINANCIALS;
    }
    else if (endpoint === 'news') ttl = CACHE_TTL.NEWS;
    
    // Cache the result
    cacheService.set(cacheKey, data, ttl);
    
    return data;
  }

  private async processBatchRequest(symbols: string[], endpoint: string): Promise<any[]> {
    // For now, we'll just process them individually
    // This can be enhanced to use batch endpoints when available
    const results = await Promise.all(
      symbols.map(symbol => this.processSingleRequest(symbol, endpoint))
    );
    
    return results.flat();
  }
}

export const batchManager = BatchManager.getInstance();

// Enhanced API service with caching, batching and standardized error handling
export const fetchWithCache = async <T>(
  symbol: string,
  endpoint: string,
  params?: any,
  forceRefresh = false
): Promise<T> => {
  try {
    const cacheKey = `${endpoint}:${symbol}:${JSON.stringify(params || {})}`;
    
    // Skip cache if forceRefresh is true
    if (!forceRefresh) {
      const cachedData = cacheService.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Add request to batch manager
    return await batchManager.addRequest<T>(endpoint, {
      symbol,
      endpoint,
      params,
      resolve: () => {}, // Will be replaced by batch manager
      reject: () => {}   // Will be replaced by batch manager
    });
  } catch (error) {
    console.error(`Error fetching ${endpoint} for ${symbol}:`, error);
    
    // Standardized error handling
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while fetching data';
    
    // Show toast for network or server errors
    if (
      errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('Network error') ||
      errorMessage.includes('API error')
    ) {
      toast.error(`Data fetch error: ${errorMessage}`);
    }
    
    throw new Error(`Failed to fetch ${endpoint} data: ${errorMessage}`);
  }
};

// Enhanced API functions with caching
export const enhancedApi = {
  // Profile endpoints
  fetchStockProfile: async (symbol: string, forceRefresh = false) => {
    return await fetchWithCache(symbol, 'profile', undefined, forceRefresh);
  },
  
  fetchStockQuote: async (symbol: string, forceRefresh = false) => {
    return await fetchWithCache(symbol, 'quote', undefined, forceRefresh);
  },
  
  // Financial endpoints
  fetchIncomeStatements: async (symbol: string, forceRefresh = false) => {
    return await fetchWithCache(symbol, 'income-statement', undefined, forceRefresh);
  },
  
  fetchBalanceSheets: async (symbol: string, forceRefresh = false) => {
    return await fetchWithCache(symbol, 'balance-sheet', undefined, forceRefresh);
  },
  
  fetchCashFlowStatements: async (symbol: string, forceRefresh = false) => {
    return await fetchWithCache(symbol, 'cash-flow', undefined, forceRefresh);
  },
  
  fetchKeyRatios: async (symbol: string, forceRefresh = false) => {
    return await fetchWithCache(symbol, 'ratios', undefined, forceRefresh);
  },
  
  // Market data endpoints
  fetchCompanyNews: async (symbol: string, forceRefresh = false) => {
    return await fetchWithCache(symbol, 'news', undefined, forceRefresh);
  },
  
  fetchCompanyPeers: async (symbol: string, forceRefresh = false) => {
    return await fetchWithCache(symbol, 'peers', undefined, forceRefresh);
  },
  
  // Document endpoints
  fetchEarningsTranscripts: async (symbol: string, forceRefresh = false) => {
    return await fetchWithCache(symbol, 'earning-transcripts', undefined, forceRefresh);
  },
  
  fetchSECFilings: async (symbol: string, forceRefresh = false) => {
    return await fetchWithCache(symbol, 'sec-filings', undefined, forceRefresh);
  }
};

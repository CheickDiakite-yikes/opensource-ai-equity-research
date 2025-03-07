import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useCacheService } from "@/services/cache/useCacheService";

import { 
  fetchStockProfile, 
  fetchStockQuote, 
  fetchIncomeStatements, 
  fetchBalanceSheets, 
  fetchCashFlowStatements, 
  fetchKeyRatios, 
  fetchCompanyNews, 
  fetchCompanyPeers, 
  fetchEarningsTranscripts,
  fetchSECFilings,
  withRetry
} from "@/services/api";

import type { 
  StockProfile, 
  StockQuote 
} from "@/types/profile/companyTypes";
import type { 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement, 
  KeyRatio 
} from "@/types/financial/statementTypes";
import type { NewsArticle } from "@/types/news/newsTypes";
import type { 
  EarningsCall,
  SECFiling
} from "@/types/documentTypes";

export interface ReportData {
  profile: StockProfile | null;
  quote: StockQuote | null;
  income: IncomeStatement[];
  balance: BalanceSheet[];
  cashflow: CashFlowStatement[];
  ratios: KeyRatio[];
  news: NewsArticle[];
  peers: string[];
  transcripts: EarningsCall[];
  filings: SECFiling[];
}

export interface DataLoadingStatus {
  [key: string]: string;
}

export const useEnhancedReportData = (symbol: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ReportData>({
    profile: null,
    quote: null,
    income: [],
    balance: [],
    cashflow: [],
    ratios: [],
    news: [],
    peers: [],
    transcripts: [],
    filings: []
  });
  const [error, setError] = useState<string | null>(null);
  const [dataLoadingStatus, setDataLoadingStatus] = useState<DataLoadingStatus>({});
  
  // Get cache service
  const cacheService = useCacheService();

  // Function to load data with caching
  const loadDataWithCaching = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDataLoadingStatus({});
      
      const statusTracker: {[key: string]: string} = {};
      const updateStatus = (key: string, status: string) => {
        statusTracker[key] = status;
        setDataLoadingStatus({...statusTracker});
      };
      
      // Try to get profile from cache first
      const cachedProfile = await cacheService.getCache<StockProfile>(`profile-${symbol}`);
      const cachedQuote = await cacheService.getCache<StockQuote>(`quote-${symbol}`);
      
      if (cachedProfile && cachedQuote) {
        // Type assertion to ensure TypeScript knows these are the correct types
        setData(prevData => ({
          ...prevData,
          profile: cachedProfile as StockProfile,
          quote: cachedQuote as StockQuote
        }));
        
        updateStatus('profile', 'success');
        updateStatus('quote', 'success');
        console.log('Using cached profile and quote data');
      }
      
      // Function to fetch data with status tracking
      const fetchWithStatus = async <T,>(
        key: string, 
        fetchFn: () => Promise<T>,
        errorValue: T,
        cacheKey?: string
      ): Promise<T> => {
        try {
          updateStatus(key, 'loading');
          
          // Check cache first if cacheKey is provided
          if (cacheKey) {
            const cachedData = await cacheService.getCache<T>(cacheKey);
            if (cachedData) {
              updateStatus(key, 'success');
              console.log(`Using cached ${key} data`);
              return cachedData as T;
            }
          }
          
          // Fetch fresh data
          const result = await withRetry(() => fetchFn(), { retries: 2, retryDelay: 1000 });
          updateStatus(key, result ? 'success' : 'empty');
          
          // Cache the result if it's valid and we have a cache key
          if (result && cacheKey) {
            await cacheService.setCache(cacheKey, result);
          }
          
          return result;
        } catch (err) {
          console.error(`Error fetching ${key}:`, err);
          updateStatus(key, 'error');
          return errorValue;
        }
      };
      
      // Fetch core data first if not cached
      if (!cachedProfile || !cachedQuote) {
        const [profile, quote] = await Promise.all([
          fetchWithStatus('profile', () => fetchStockProfile(symbol), null, `profile-${symbol}`),
          fetchWithStatus('quote', () => fetchStockQuote(symbol), null, `quote-${symbol}`)
        ]);
        
        if (!profile || !quote) {
          throw new Error(`Could not fetch core data for ${symbol}`);
        }
        
        setData(prevData => ({
          ...prevData,
          profile,
          quote
        }));
      }
      
      // Try to get financial data from cache
      const cachedIncome = await cacheService.getCache<IncomeStatement[]>(`income-${symbol}`);
      if (cachedIncome) {
        setData(prevData => ({
          ...prevData,
          income: cachedIncome as IncomeStatement[]
        }));
        updateStatus('income', 'success');
        console.log('Using cached income statement data');
      }
      
      // Try to get balance sheet data from cache
      const cachedBalance = await cacheService.getCache<BalanceSheet[]>(`balance-${symbol}`);
      if (cachedBalance) {
        setData(prevData => ({
          ...prevData,
          balance: cachedBalance as BalanceSheet[]
        }));
        updateStatus('balance', 'success');
        console.log('Using cached balance sheet data');
      }
      
      // Try to get cash flow data from cache
      const cachedCashFlow = await cacheService.getCache<CashFlowStatement[]>(`cashflow-${symbol}`);
      if (cachedCashFlow) {
        setData(prevData => ({
          ...prevData,
          cashflow: cachedCashFlow as CashFlowStatement[]
        }));
        updateStatus('cashflow', 'success');
        console.log('Using cached cash flow data');
      }
      
      // Fetch financial data with staggered approach
      const [income, balance, cashflow] = await Promise.all([
        !cachedIncome ? fetchWithStatus('income', () => fetchIncomeStatements(symbol), [], `income-${symbol}`) : (cachedIncome as IncomeStatement[]),
        !cachedBalance ? fetchWithStatus('balance', () => fetchBalanceSheets(symbol), [], `balance-${symbol}`) : (cachedBalance as BalanceSheet[]),
        !cachedCashFlow ? fetchWithStatus('cashflow', () => fetchCashFlowStatements(symbol), [], `cashflow-${symbol}`) : (cachedCashFlow as CashFlowStatement[])
      ]);
      
      // Update state with financial data
      setData(prevData => ({
        ...prevData,
        income,
        balance,
        cashflow
      }));
      
      // Second batch of data (less critical)
      const [ratios, news, peers] = await Promise.all([
        fetchWithStatus('ratios', () => fetchKeyRatios(symbol), [], `ratios-${symbol}`),
        fetchWithStatus('news', () => fetchCompanyNews(symbol), [], `news-${symbol}`),
        fetchWithStatus('peers', () => fetchCompanyPeers(symbol), [], `peers-${symbol}`)
      ]);
      
      // Update state with second batch
      setData(prevData => ({
        ...prevData,
        ratios,
        news,
        peers
      }));
      
      // Final batch (lowest priority)
      const [transcripts, filings] = await Promise.all([
        fetchWithStatus('transcripts', () => fetchEarningsTranscripts(symbol), [], `transcripts-${symbol}`),
        fetchWithStatus('filings', () => fetchSECFilings(symbol), [], `filings-${symbol}`)
      ]);
      
      // Set final data
      setData(prevData => ({
        ...prevData,
        transcripts,
        filings
      }));
      
      console.log(`Data loaded for ${symbol}:`, {
        profile: !!data.profile,
        quote: !!data.quote,
        income: income.length,
        balance: balance.length,
        cashflow: cashflow.length,
        ratios: ratios.length,
        news: news.length,
        peers: peers.length,
        transcripts: transcripts.length,
        filings: filings.length
      });
      
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err instanceof Error ? err.message : String(err));
      toast(`Failed to load data for ${symbol}: ${err instanceof Error ? err.message : String(err)}`, {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [symbol, cacheService]);

  useEffect(() => {
    if (symbol) {
      loadDataWithCaching();
    }
  }, [symbol, loadDataWithCaching]);

  const hasStockData = Boolean(data.profile && data.quote);
  const hasFinancialData = data.income.length > 0 && data.balance.length > 0;
  const showDataWarning = hasStockData && !hasFinancialData;

  return {
    isLoading,
    data,
    error,
    dataLoadingStatus,
    hasStockData,
    hasFinancialData,
    showDataWarning,
    refreshData: loadDataWithCaching
  };
};

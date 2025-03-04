
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { enhancedApi } from "@/services/api/enhancedApiService";

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

  // Function to update a specific data field
  const updateDataField = <K extends keyof ReportData>(field: K, value: ReportData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Implement staggered loading
  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      
      try {
        setIsLoading(true);
        setError(null);
        setDataLoadingStatus({});
        
        const statusTracker: {[key: string]: string} = {};
        const updateStatus = (key: string, status: string) => {
          statusTracker[key] = status;
          setDataLoadingStatus({...statusTracker});
        };
        
        // Stage 1: Critical data (profile and quote)
        try {
          updateStatus('profile', 'loading');
          updateStatus('quote', 'loading');
          
          const [profile, quote] = await Promise.all([
            enhancedApi.fetchStockProfile(symbol),
            enhancedApi.fetchStockQuote(symbol)
          ]);
          
          updateDataField('profile', profile);
          updateDataField('quote', quote);
          
          updateStatus('profile', profile ? 'success' : 'empty');
          updateStatus('quote', quote ? 'success' : 'empty');
          
          if (!profile || !quote) {
            throw new Error(`Could not fetch core data for ${symbol}`);
          }
          
          // Stage 2: Financial statements (important but can load after profile/quote)
          setTimeout(async () => {
            try {
              const financialPromises = [
                { key: 'income', promise: enhancedApi.fetchIncomeStatements(symbol) },
                { key: 'balance', promise: enhancedApi.fetchBalanceSheets(symbol) },
                { key: 'cashflow', promise: enhancedApi.fetchCashFlowStatements(symbol) },
                { key: 'ratios', promise: enhancedApi.fetchKeyRatios(symbol) }
              ];
              
              for (const { key, promise } of financialPromises) {
                updateStatus(key, 'loading');
                try {
                  const result = await promise;
                  updateDataField(key as keyof ReportData, result);
                  updateStatus(key, result && Array.isArray(result) && result.length > 0 ? 'success' : 'empty');
                } catch (err) {
                  console.error(`Error loading ${key}:`, err);
                  updateStatus(key, 'error');
                }
              }
              
              // Stage 3: Secondary data (load after financials)
              setTimeout(async () => {
                try {
                  const secondaryPromises = [
                    { key: 'news', promise: enhancedApi.fetchCompanyNews(symbol) },
                    { key: 'peers', promise: enhancedApi.fetchCompanyPeers(symbol) }
                  ];
                  
                  for (const { key, promise } of secondaryPromises) {
                    updateStatus(key, 'loading');
                    try {
                      const result = await promise;
                      updateDataField(key as keyof ReportData, result);
                      updateStatus(key, result && Array.isArray(result) && result.length > 0 ? 'success' : 'empty');
                    } catch (err) {
                      console.error(`Error loading ${key}:`, err);
                      updateStatus(key, 'error');
                    }
                  }
                  
                  // Stage 4: Document data (load last, as they're the largest and slowest)
                  setTimeout(async () => {
                    try {
                      const documentPromises = [
                        { key: 'transcripts', promise: enhancedApi.fetchEarningsTranscripts(symbol) },
                        { key: 'filings', promise: enhancedApi.fetchSECFilings(symbol) }
                      ];
                      
                      for (const { key, promise } of documentPromises) {
                        updateStatus(key, 'loading');
                        try {
                          const result = await promise;
                          updateDataField(key as keyof ReportData, result);
                          updateStatus(key, result && Array.isArray(result) && result.length > 0 ? 'success' : 'empty');
                        } catch (err) {
                          console.error(`Error loading ${key}:`, err);
                          updateStatus(key, 'error');
                        }
                      }
                    } catch (err) {
                      console.error("Error in document data stage:", err);
                    } finally {
                      setIsLoading(false);
                    }
                  }, 200);
                } catch (err) {
                  console.error("Error in secondary data stage:", err);
                  setIsLoading(false);
                }
              }, 200);
            } catch (err) {
              console.error("Error in financial data stage:", err);
              setIsLoading(false);
            }
          }, 100);
          
        } catch (err) {
          console.error("Error in core data stage:", err);
          setError(err.message || "Failed to load core data");
          setIsLoading(false);
          
          toast({
            title: "Error Loading Data",
            description: `Failed to load data for ${symbol}: ${err.message}`,
            variant: "destructive",
          });
        }
        
      } catch (err) {
        console.error("Error in main fetch flow:", err);
        setError(err.message || "An unexpected error occurred");
        setIsLoading(false);
        
        toast({
          title: "Error Loading Data",
          description: `Failed to load data for ${symbol}: ${err.message}`,
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [symbol]);

  // Function to manually refresh data
  const refreshData = async (dataType?: keyof ReportData) => {
    if (!symbol) return;
    
    try {
      if (dataType) {
        // Refresh specific data type
        setDataLoadingStatus(prev => ({ ...prev, [dataType]: 'loading' }));
        
        let result;
        switch (dataType) {
          case 'profile':
            result = await enhancedApi.fetchStockProfile(symbol, true);
            break;
          case 'quote':
            result = await enhancedApi.fetchStockQuote(symbol, true);
            break;
          case 'income':
            result = await enhancedApi.fetchIncomeStatements(symbol, true);
            break;
          case 'balance':
            result = await enhancedApi.fetchBalanceSheets(symbol, true);
            break;
          case 'cashflow':
            result = await enhancedApi.fetchCashFlowStatements(symbol, true);
            break;
          case 'ratios':
            result = await enhancedApi.fetchKeyRatios(symbol, true);
            break;
          case 'news':
            result = await enhancedApi.fetchCompanyNews(symbol, true);
            break;
          case 'peers':
            result = await enhancedApi.fetchCompanyPeers(symbol, true);
            break;
          case 'transcripts':
            result = await enhancedApi.fetchEarningsTranscripts(symbol, true);
            break;
          case 'filings':
            result = await enhancedApi.fetchSECFilings(symbol, true);
            break;
        }
        
        updateDataField(dataType, result);
        setDataLoadingStatus(prev => ({ 
          ...prev, 
          [dataType]: result && (Array.isArray(result) ? result.length > 0 : true) ? 'success' : 'empty' 
        }));
        
        toast({
          title: "Data Refreshed",
          description: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data has been refreshed.`,
        });
      } else {
        // Refresh all data
        toast({
          title: "Refreshing All Data",
          description: "Fetching latest data for all sections...",
        });
        
        setIsLoading(true);
        // Re-trigger the main data fetching flow
        setTimeout(() => {
          fetchData();
        }, 100);
      }
    } catch (err) {
      console.error(`Error refreshing ${dataType || 'all'} data:`, err);
      setDataLoadingStatus(prev => ({ ...prev, [dataType || 'all']: 'error' }));
      
      toast({
        title: "Error Refreshing Data",
        description: `Failed to refresh ${dataType || 'all'} data: ${err.message}`,
        variant: "destructive",
      });
    }
  };

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
    refreshData
  };
};

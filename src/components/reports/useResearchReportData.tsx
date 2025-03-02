import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

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
  fetchSECFilings
} from "@/services/api";

import type { 
  StockProfile, 
  StockQuote, 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement, 
  KeyRatio, 
  NewsArticle, 
  EarningsCall,
  SECFiling
} from "@/types";

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

export const useResearchReportData = (symbol: string) => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setDataLoadingStatus({});
        
        const statusTracker: {[key: string]: string} = {};
        const updateStatus = (key: string, status: string) => {
          statusTracker[key] = status;
          setDataLoadingStatus({...statusTracker});
        };
        
        const fetchWithStatus = async <T,>(
          key: string, 
          fetchFn: () => Promise<T>,
          errorValue: T
        ): Promise<T> => {
          try {
            updateStatus(key, 'loading');
            const result = await fetchFn();
            updateStatus(key, result ? 'success' : 'empty');
            return result;
          } catch (err) {
            console.error(`Error fetching ${key}:`, err);
            updateStatus(key, 'error');
            return errorValue;
          }
        };
        
        const [profile, quote] = await Promise.all([
          fetchWithStatus('profile', () => fetchStockProfile(symbol), null),
          fetchWithStatus('quote', () => fetchStockQuote(symbol), null)
        ]);
        
        if (!profile || !quote) {
          throw new Error(`Could not fetch core data for ${symbol}`);
        }
        
        const [income, balance, cashflow, ratios, news, peers, transcripts, filings] = await Promise.all([
          fetchWithStatus('income', () => fetchIncomeStatements(symbol), []),
          fetchWithStatus('balance', () => fetchBalanceSheets(symbol), []),
          fetchWithStatus('cashflow', () => fetchCashFlowStatements(symbol), []),
          fetchWithStatus('ratios', () => fetchKeyRatios(symbol), []),
          fetchWithStatus('news', () => fetchCompanyNews(symbol), []),
          fetchWithStatus('peers', () => fetchCompanyPeers(symbol), []),
          fetchWithStatus('transcripts', () => fetchEarningsTranscripts(symbol), []),
          fetchWithStatus('filings', () => fetchSECFilings(symbol), [])
        ]);
        
        setData({
          profile,
          quote,
          income,
          balance,
          cashflow,
          ratios,
          news,
          peers,
          transcripts,
          filings
        });
        
        console.log(`Data loaded for ${symbol}:`, {
          profile: !!profile,
          quote: !!quote,
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
        setError(err.message);
        toast({
          title: "Error Loading Data",
          description: `Failed to load data for ${symbol}: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

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
    showDataWarning
  };
};

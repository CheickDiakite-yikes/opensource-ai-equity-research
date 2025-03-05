
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

import { 
  fetchStockProfile, 
  fetchStockQuote, 
  fetchIncomeStatements, 
  fetchBalanceSheets, 
  fetchCashFlowStatements, 
  fetchKeyRatios, 
  fetchKeyRatiosTTM,
  fetchIncomeStatementTTM,
  fetchBalanceSheetTTM,
  fetchCashFlowStatementTTM,
  fetchCompanyNews, 
  fetchCompanyPeers, 
  fetchEarningsTranscripts,
  fetchSECFilings
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
import type { 
  KeyRatioTTM 
} from "@/types/financial/metrics/keyRatioTTM";
import type { NewsArticle } from "@/types/news/newsTypes";
import type { 
  EarningsCall,
  SECFiling
} from "@/types/documentTypes";
import type {
  IncomeStatementTTM 
} from "@/types/financial/ttm/incomeStatementTTM";
import type {
  BalanceSheetTTM 
} from "@/types/financial/ttm/balanceSheetTTM";
import type {
  CashFlowStatementTTM 
} from "@/types/financial/ttm/cashFlowTTM";

export interface ReportData {
  profile: StockProfile | null;
  quote: StockQuote | null;
  income: IncomeStatement[];
  incomeTTM: IncomeStatementTTM | null;
  balance: BalanceSheet[];
  balanceTTM: BalanceSheetTTM | null;
  cashflow: CashFlowStatement[];
  cashflowTTM: CashFlowStatementTTM | null;
  ratios: KeyRatio[];
  ratiosTTM: KeyRatioTTM | null;
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
    incomeTTM: null,
    balance: [],
    balanceTTM: null,
    cashflow: [],
    cashflowTTM: null,
    ratios: [],
    ratiosTTM: null,
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
        
        const [
          income, 
          incomeTTM,
          balance, 
          balanceTTM,
          cashflow, 
          cashflowTTM,
          ratios, 
          ratiosTTM,
          news, 
          peers, 
          transcripts, 
          filings
        ] = await Promise.all([
          fetchWithStatus('income', () => fetchIncomeStatements(symbol), []),
          fetchWithStatus('incomeTTM', () => fetchIncomeStatementTTM(symbol), null),
          fetchWithStatus('balance', () => fetchBalanceSheets(symbol), []),
          fetchWithStatus('balanceTTM', () => fetchBalanceSheetTTM(symbol), null),
          fetchWithStatus('cashflow', () => fetchCashFlowStatements(symbol), []),
          fetchWithStatus('cashflowTTM', () => fetchCashFlowStatementTTM(symbol), null),
          fetchWithStatus('ratios', () => fetchKeyRatios(symbol), []),
          fetchWithStatus('ratiosTTM', () => fetchKeyRatiosTTM(symbol), null),
          fetchWithStatus('news', () => fetchCompanyNews(symbol), []),
          fetchWithStatus('peers', () => fetchCompanyPeers(symbol), []),
          fetchWithStatus('transcripts', () => fetchEarningsTranscripts(symbol), []),
          fetchWithStatus('filings', () => fetchSECFilings(symbol), [])
        ]);
        
        setData({
          profile,
          quote,
          income,
          incomeTTM,
          balance,
          balanceTTM,
          cashflow,
          cashflowTTM,
          ratios: ratios as KeyRatio[], // Ensure we cast this to KeyRatio[] from types/financial/statementTypes
          ratiosTTM,
          news,
          peers,
          transcripts,
          filings
        });
        
        console.log(`Data loaded for ${symbol}:`, {
          profile: !!profile,
          quote: !!quote,
          income: income.length,
          incomeTTM: !!incomeTTM,
          balance: balance.length,
          balanceTTM: !!balanceTTM,
          cashflow: cashflow.length,
          cashflowTTM: !!cashflowTTM,
          ratios: ratios.length,
          ratiosTTM: !!ratiosTTM,
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


import { useState } from "react";
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
import { ReportData, DataLoadingStatus } from "./types";

export const useFetchReportData = () => {
  const [dataLoadingStatus, setDataLoadingStatus] = useState<DataLoadingStatus>({});

  const fetchWithStatus = async <T,>(
    key: string, 
    fetchFn: () => Promise<T>,
    errorValue: T,
    statusTracker: {[key: string]: string}
  ): Promise<T> => {
    try {
      statusTracker[key] = 'loading';
      setDataLoadingStatus({...statusTracker});
      
      const result = await fetchFn();
      
      statusTracker[key] = result ? 'success' : 'empty';
      setDataLoadingStatus({...statusTracker});
      
      return result;
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      statusTracker[key] = 'error';
      setDataLoadingStatus({...statusTracker});
      return errorValue;
    }
  };

  const fetchAllData = async (symbol: string): Promise<{
    data: ReportData;
    error: string | null;
  }> => {
    const statusTracker: {[key: string]: string} = {};
    let error: string | null = null;
    
    try {
      // Fetch core data first (profile and quote)
      const [profile, quote] = await Promise.all([
        fetchWithStatus('profile', () => fetchStockProfile(symbol), null, statusTracker),
        fetchWithStatus('quote', () => fetchStockQuote(symbol), null, statusTracker)
      ]);
      
      if (!profile || !quote) {
        throw new Error(`Could not fetch core data for ${symbol}`);
      }
      
      // Fetch all financial data in parallel
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
        fetchWithStatus('income', () => fetchIncomeStatements(symbol), [], statusTracker),
        fetchWithStatus('incomeTTM', () => fetchIncomeStatementTTM(symbol), null, statusTracker),
        fetchWithStatus('balance', () => fetchBalanceSheets(symbol), [], statusTracker),
        fetchWithStatus('balanceTTM', () => fetchBalanceSheetTTM(symbol), null, statusTracker),
        fetchWithStatus('cashflow', () => fetchCashFlowStatements(symbol), [], statusTracker),
        fetchWithStatus('cashflowTTM', () => fetchCashFlowStatementTTM(symbol), null, statusTracker),
        fetchWithStatus('ratios', () => fetchKeyRatios(symbol), [], statusTracker),
        fetchWithStatus('ratiosTTM', () => fetchKeyRatiosTTM(symbol), null, statusTracker),
        fetchWithStatus('news', () => fetchCompanyNews(symbol), [], statusTracker),
        fetchWithStatus('peers', () => fetchCompanyPeers(symbol), [], statusTracker),
        fetchWithStatus('transcripts', () => fetchEarningsTranscripts(symbol), [], statusTracker),
        fetchWithStatus('filings', () => fetchSECFilings(symbol), [], statusTracker)
      ]);
      
      const data: ReportData = {
        profile,
        quote,
        income,
        incomeTTM,
        balance,
        balanceTTM,
        cashflow,
        cashflowTTM,
        ratios: ratios as KeyRatio[],
        ratiosTTM,
        news,
        peers,
        transcripts,
        filings
      };
      
      // Log data loading results
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
      
      return { data, error: null };
    } catch (err) {
      console.error("Error fetching report data:", err);
      error = err.message;
      
      toast({
        title: "Error Loading Data",
        description: `Failed to load data for ${symbol}: ${err.message}`,
        variant: "destructive",
      });
      
      return { 
        data: {
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
        },
        error
      };
    }
  };

  return {
    fetchAllData,
    dataLoadingStatus
  };
};

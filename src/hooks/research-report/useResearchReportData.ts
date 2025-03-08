
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

import { KeyRatio } from "@/types/financial/ratioTypes";
import { DataLoadingStatus, ReportData, ResearchReportDataResult } from "./types";
import { createEmptyReportData, fetchWithStatus, logDataStatus } from "./fetchUtils";

export const useResearchReportData = (symbol: string): ResearchReportDataResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ReportData>(createEmptyReportData());
  const [error, setError] = useState<string | null>(null);
  const [dataLoadingStatus, setDataLoadingStatus] = useState<DataLoadingStatus>({});
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      
      try {
        setIsLoading(true);
        setError(null);
        setDataLoadingStatus({});
        setLoadCount(prev => prev + 1);
        const currentLoadCount = loadCount + 1;
        
        const statusTracker: {[key: string]: string} = {};
        const updateStatus = (key: string, status: string) => {
          statusTracker[key] = status;
          // Only update if this is still the current fetch operation
          if (currentLoadCount === loadCount + 1) {
            setDataLoadingStatus({...statusTracker});
          }
        };
        
        // First fetch core profile and quote data
        const [profile, quote] = await Promise.all([
          fetchWithStatus(statusTracker, updateStatus, 'profile', 
            () => fetchStockProfile(symbol), null),
          fetchWithStatus(statusTracker, updateStatus, 'quote', 
            () => fetchStockQuote(symbol), null)
        ]);
        
        if (!profile || !quote) {
          throw new Error(`Could not fetch core data for ${symbol}`);
        }
        
        // Then fetch all other data in parallel
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
          fetchWithStatus(statusTracker, updateStatus, 'income', 
            () => fetchIncomeStatements(symbol), []),
          fetchWithStatus(statusTracker, updateStatus, 'incomeTTM', 
            () => fetchIncomeStatementTTM(symbol), null),
          fetchWithStatus(statusTracker, updateStatus, 'balance', 
            () => fetchBalanceSheets(symbol), []),
          fetchWithStatus(statusTracker, updateStatus, 'balanceTTM', 
            () => fetchBalanceSheetTTM(symbol), null),
          fetchWithStatus(statusTracker, updateStatus, 'cashflow', 
            () => fetchCashFlowStatements(symbol), []),
          fetchWithStatus(statusTracker, updateStatus, 'cashflowTTM', 
            () => fetchCashFlowStatementTTM(symbol), null),
          fetchWithStatus(statusTracker, updateStatus, 'ratios', 
            () => fetchKeyRatios(symbol), []),
          fetchWithStatus(statusTracker, updateStatus, 'ratiosTTM', 
            () => fetchKeyRatiosTTM(symbol), null),
          fetchWithStatus(statusTracker, updateStatus, 'news', 
            () => fetchCompanyNews(symbol), []),
          fetchWithStatus(statusTracker, updateStatus, 'peers', 
            () => fetchCompanyPeers(symbol), []),
          fetchWithStatus(statusTracker, updateStatus, 'transcripts', 
            () => fetchEarningsTranscripts(symbol), []),
          fetchWithStatus(statusTracker, updateStatus, 'filings', 
            () => fetchSECFilings(symbol), [])
        ]);
        
        // Only update state if this is still the current fetch operation
        if (currentLoadCount === loadCount + 1) {
          const newData: ReportData = {
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
          
          setData(newData);
          logDataStatus(symbol, newData);
        }
        
      } catch (err) {
        console.error("Error fetching report data:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        toast({
          title: "Error Loading Data",
          description: `Failed to load data for ${symbol}: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        // Only update loading state if this is still the current fetch
        if (currentLoadCount === loadCount + 1) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [symbol, loadCount]);

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

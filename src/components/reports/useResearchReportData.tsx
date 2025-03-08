
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { fetchAllReportData, updateStatus } from "./utils/reportDataFetcher";
import { ReportData, DataLoadingStatus, ReportDataHookResult } from "./types/reportTypes";

// Initial empty report data
const emptyReportData: ReportData = {
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
};

export const useResearchReportData = (symbol: string): ReportDataHookResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ReportData>(emptyReportData);
  const [error, setError] = useState<string | null>(null);
  const [dataLoadingStatus, setDataLoadingStatus] = useState<DataLoadingStatus>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) {
        console.warn("No symbol provided to useResearchReportData.");
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        setDataLoadingStatus({});
        
        // Clear all previous data
        setData(emptyReportData);
        
        const statusTracker: {[key: string]: string} = {};
        
        // Fetch all report data
        const reportData = await fetchAllReportData(symbol, statusTracker, setDataLoadingStatus);
        setData(reportData);
        
        console.log(`Data loaded for ${symbol}:`, {
          profile: !!reportData.profile,
          quote: !!reportData.quote,
          income: reportData.income.length,
          incomeTTM: !!reportData.incomeTTM,
          balance: reportData.balance.length,
          balanceTTM: !!reportData.balanceTTM,
          cashflow: reportData.cashflow.length,
          cashflowTTM: !!reportData.cashflowTTM,
          ratios: reportData.ratios.length,
          ratiosTTM: !!reportData.ratiosTTM,
          news: reportData.news.length,
          peers: reportData.peers.length,
          transcripts: reportData.transcripts.length,
          filings: reportData.filings.length
        });
        
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError(err instanceof Error ? err.message : String(err));
        toast({
          title: "Error Loading Data",
          description: `Failed to load data for ${symbol}: ${err instanceof Error ? err.message : String(err)}`,
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

// Re-export the types for easier access
export type { ReportData, DataLoadingStatus } from "./types/reportTypes";

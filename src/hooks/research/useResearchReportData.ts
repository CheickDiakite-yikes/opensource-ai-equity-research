
import { useState, useEffect } from "react";
import { useFetchReportData } from "./useFetchReportData";
import { ReportData, ResearchReportDataReturn } from "./types";

export const useResearchReportData = (symbol: string): ResearchReportDataReturn => {
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
  
  const { fetchAllData, dataLoadingStatus } = useFetchReportData();

  useEffect(() => {
    const loadData = async () => {
      if (!symbol) return;
      
      setIsLoading(true);
      
      const { data: fetchedData, error: fetchError } = await fetchAllData(symbol);
      
      setData(fetchedData);
      setError(fetchError);
      setIsLoading(false);
    };

    loadData();
  }, [symbol, fetchAllData]);

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

// Re-export types for convenience
export * from "./types";

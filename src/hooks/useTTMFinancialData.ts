
import { useState, useEffect } from "react";
import { 
  fetchIncomeStatementTTM,
  fetchBalanceSheetTTM,
  fetchCashFlowStatementTTM, 
  fetchKeyRatiosTTM,
  fetchKeyMetricsTTM
} from "@/services/api/financialService";

export const useTTMFinancialData = (symbol: string) => {
  const [ttmData, setTtmData] = useState<{
    income: any | null;
    balance: any | null;
    cashflow: any | null;
    ratios: any | null;
    metrics: any | null;
  }>({
    income: null,
    balance: null,
    cashflow: null,
    ratios: null,
    metrics: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataAvailable, setDataAvailable] = useState(false);

  useEffect(() => {
    const fetchTTMData = async () => {
      if (!symbol) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const [income, balance, cashflow, ratios, metrics] = await Promise.all([
          fetchIncomeStatementTTM(symbol),
          fetchBalanceSheetTTM(symbol),
          fetchCashFlowStatementTTM(symbol),
          fetchKeyRatiosTTM(symbol),
          fetchKeyMetricsTTM(symbol)
        ]);
        
        setTtmData({
          income,
          balance,
          cashflow,
          ratios,
          metrics
        });
        
        // Check if any data is available
        const hasData = Boolean(income || balance || cashflow || ratios || metrics);
        setDataAvailable(hasData);
        
        console.log("TTM data loaded:", { income, balance, cashflow, ratios, metrics });
      } catch (err) {
        console.error("Error loading TTM financial data:", err);
        setError("Failed to load TTM financial data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTTMData();
  }, [symbol]);

  return {
    ttmData,
    isLoading,
    error,
    dataAvailable
  };
};

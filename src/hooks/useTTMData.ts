
import { useState, useEffect } from "react";
import { invokeSupabaseFunction } from "@/services/api/base";
import { TTMData } from "@/types/financialDataTypes";

export const useTTMData = (symbol: string) => {
  const [ttmData, setTtmData] = useState<TTMData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTTMData = async () => {
      if (!symbol) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // First fetch income statement TTM data
        const incomeTTM = await invokeSupabaseFunction<any>('get-stock-data', { 
          symbol, 
          endpoint: 'income-statement-ttm'
        });
        
        if (!incomeTTM || !Array.isArray(incomeTTM) || incomeTTM.length === 0) {
          console.warn("No income statement TTM data available for", symbol);
        }
        
        // Then fetch key metrics TTM
        const keyMetricsTTM = await invokeSupabaseFunction<any>('get-stock-data', {
          symbol,
          endpoint: 'key-metrics-ttm'
        });
        
        if (!keyMetricsTTM || !Array.isArray(keyMetricsTTM) || keyMetricsTTM.length === 0) {
          console.warn("No key metrics TTM data available for", symbol);
        }
        
        // Then fetch ratios TTM
        const ratiosTTM = await invokeSupabaseFunction<any>('get-stock-data', {
          symbol,
          endpoint: 'ratios-ttm'
        });
        
        if (!ratiosTTM || !Array.isArray(ratiosTTM) || ratiosTTM.length === 0) {
          console.warn("No ratios TTM data available for", symbol);
        }
        
        // Combine data from all endpoints
        const income = incomeTTM?.[0] || {};
        const keyMetrics = keyMetricsTTM?.[0] || {};
        const ratios = ratiosTTM?.[0] || {};
        
        // Calculate margins if income data exists
        let grossMargin, operatingMargin, netMargin;
        
        if (income.revenue) {
          grossMargin = income.grossProfit / income.revenue;
          operatingMargin = income.operatingIncome / income.revenue;
          netMargin = income.netIncome / income.revenue;
        }
        
        setTtmData({
          // From income statement
          revenue: income.revenue,
          grossProfit: income.grossProfit,
          operatingIncome: income.operatingIncome,
          netIncome: income.netIncome,
          eps: income.eps,
          
          // From key metrics TTM
          peRatio: keyMetrics.peRatio || ratios.priceToEarningsRatioTTM,
          pbRatio: keyMetrics.pbRatio || ratios.priceToBookRatioTTM,
          roe: keyMetrics.returnOnEquityTTM || ratios.returnOnEquityTTM,
          roa: keyMetrics.returnOnAssetsTTM,
          currentRatio: keyMetrics.currentRatioTTM || ratios.currentRatioTTM,
          debtToEquity: keyMetrics.debtToEquityRatioTTM || ratios.debtToEquityRatioTTM,
          
          // From income statement calculations or ratios TTM
          grossMargin: grossMargin || ratios.grossProfitMarginTTM,
          operatingMargin: operatingMargin || ratios.operatingProfitMarginTTM,
          netMargin: netMargin || ratios.netProfitMarginTTM
        });
      } catch (err) {
        console.error("Error fetching TTM data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTTMData();
  }, [symbol]);

  return { ttmData, isLoading, error };
};

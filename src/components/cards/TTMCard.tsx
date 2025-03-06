
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { invokeSupabaseFunction } from "@/services/api/core/edgeFunctions";
import { TTMData } from "@/types/financialDataTypes";

interface TTMCardProps {
  symbol: string;
  className?: string;
}

const TTMCard: React.FC<TTMCardProps> = ({ symbol, className }) => {
  const [ttmData, setTtmData] = useState<TTMData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTTMData = async () => {
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
        
        console.log("TTM Data fetched:", {
          incomeTTM: incomeTTM?.[0] || null,
          keyMetricsTTM: keyMetricsTTM?.[0] || null,
          ratiosTTM: ratiosTTM?.[0] || null
        });
        
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

    if (symbol) {
      fetchTTMData();
    }
  }, [symbol]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">TTM (Latest 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !ttmData) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">TTM (Latest 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || "Could not load TTM data for this symbol."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">TTM (Latest 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">P/E Ratio</dt>
            <dd className="font-medium">{ttmData.peRatio ? ttmData.peRatio.toFixed(2) + 'x' : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">P/B Ratio</dt>
            <dd className="font-medium">{ttmData.pbRatio ? ttmData.pbRatio.toFixed(2) + 'x' : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ROE</dt>
            <dd className="font-medium">{ttmData.roe !== undefined ? formatPercentage(ttmData.roe * 100) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ROA</dt>
            <dd className="font-medium">{ttmData.roa !== undefined ? formatPercentage(ttmData.roa * 100) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Current Ratio</dt>
            <dd className="font-medium">{ttmData.currentRatio ? ttmData.currentRatio.toFixed(2) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Debt/Equity</dt>
            <dd className="font-medium">{ttmData.debtToEquity ? ttmData.debtToEquity.toFixed(2) + 'x' : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Gross Margin</dt>
            <dd className="font-medium">{ttmData.grossMargin !== undefined ? formatPercentage(ttmData.grossMargin * 100) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Net Margin</dt>
            <dd className="font-medium">{ttmData.netMargin !== undefined ? formatPercentage(ttmData.netMargin * 100) : 'N/A'}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default TTMCard;


import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { invokeSupabaseFunction } from "@/services/api/base";
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
        
        const data = await invokeSupabaseFunction<any>('get-stock-data', { 
          symbol, 
          endpoint: 'income-statement-ttm'
        });
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error("No TTM data available");
        }
        
        const ttm = data[0];
        
        // Calculate margins
        const grossMargin = ttm.grossProfit / ttm.revenue;
        const operatingMargin = ttm.operatingIncome / ttm.revenue;
        const netMargin = ttm.netIncome / ttm.revenue;
        
        // Also fetch key ratios TTM
        const ratiosTTM = await invokeSupabaseFunction<any>('get-stock-data', {
          symbol,
          endpoint: 'key-metrics-ttm'
        });
        
        // Combine data from both endpoints
        setTtmData({
          revenue: ttm.revenue,
          grossProfit: ttm.grossProfit,
          operatingIncome: ttm.operatingIncome,
          netIncome: ttm.netIncome,
          eps: ttm.eps,
          grossMargin,
          operatingMargin,
          netMargin,
          peRatio: ratiosTTM?.[0]?.peRatio,
          pbRatio: ratiosTTM?.[0]?.pbRatio,
          roe: ratiosTTM?.[0]?.returnOnEquity,
          roa: ratiosTTM?.[0]?.returnOnAssets,
          currentRatio: ratiosTTM?.[0]?.currentRatio,
          debtToEquity: ratiosTTM?.[0]?.debtToEquity
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

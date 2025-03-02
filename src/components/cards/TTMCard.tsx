
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { BarChart4 } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { invokeSupabaseFunction } from "@/services/api/base";

interface TTMData {
  revenue?: number;
  grossProfit?: number;
  operatingIncome?: number;
  netIncome?: number;
  eps?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
  roe?: number;
  roa?: number;
}

interface TTMCardProps {
  symbol: string;
}

const TTMCard: React.FC<TTMCardProps> = ({ symbol }) => {
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
        
        setTtmData({
          revenue: ttm.revenue,
          grossProfit: ttm.grossProfit,
          operatingIncome: ttm.operatingIncome,
          netIncome: ttm.netIncome,
          eps: ttm.eps,
          grossMargin,
          operatingMargin,
          netMargin,
          roe: ttm.returnOnEquity,
          roa: ttm.returnOnAssets
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
      <Card className="min-h-[350px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart4 className="h-5 w-5" />
            TTM (Loading...)
          </CardTitle>
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
      <Card className="min-h-[350px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart4 className="h-5 w-5" />
            TTM (Data Unavailable)
          </CardTitle>
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart4 className="h-5 w-5" />
          TTM (Trailing Twelve Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Revenue</dt>
            <dd className="font-medium">{formatCurrency(ttmData.revenue || 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Gross Profit</dt>
            <dd className="font-medium">{formatCurrency(ttmData.grossProfit || 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Operating Income</dt>
            <dd className="font-medium">{formatCurrency(ttmData.operatingIncome || 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Net Income</dt>
            <dd className="font-medium">{formatCurrency(ttmData.netIncome || 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">EPS</dt>
            <dd className="font-medium">{ttmData.eps?.toFixed(2) || 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Gross Margin</dt>
            <dd className="font-medium">{formatPercentage(ttmData.grossMargin * 100 || 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Operating Margin</dt>
            <dd className="font-medium">{formatPercentage(ttmData.operatingMargin * 100 || 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Net Margin</dt>
            <dd className="font-medium">{formatPercentage(ttmData.netMargin * 100 || 0)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default TTMCard;

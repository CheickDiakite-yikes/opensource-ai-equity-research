
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchKeyRatiosTTM, fetchKeyMetricsTTM } from "@/services/api/financialService";
import { Skeleton } from "@/components/ui/skeleton";

interface TTMRatioDisplayProps {
  symbol: string;
}

const TTMRatioDisplay: React.FC<TTMRatioDisplayProps> = ({ symbol }) => {
  const [ttmRatios, setTtmRatios] = useState<any | null>(null);
  const [ttmMetrics, setTtmMetrics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTTMData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch both TTM datasets in parallel
        const [ratios, metrics] = await Promise.all([
          fetchKeyRatiosTTM(symbol),
          fetchKeyMetricsTTM(symbol)
        ]);
        
        setTtmRatios(ratios);
        setTtmMetrics(metrics);
        
        console.log("TTM data loaded:", { ratios, metrics });
      } catch (err) {
        console.error("Error loading TTM data:", err);
        setError("Failed to load TTM data");
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
      <Card>
        <CardHeader>
          <CardTitle>TTM (Trailing Twelve Months)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (error || (!ttmRatios && !ttmMetrics)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>TTM (Trailing Twelve Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No TTM data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>TTM (Trailing Twelve Months)</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {ttmRatios && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">P/E Ratio</span>
              <span className="font-medium">{ttmRatios.priceEarningsRatioTTM?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">P/B Ratio</span>
              <span className="font-medium">{ttmRatios.priceToBookRatioTTM?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROE</span>
              <span className="font-medium">{(ttmRatios.returnOnEquityTTM * 100)?.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROA</span>
              <span className="font-medium">{(ttmRatios.returnOnAssetsTTM * 100)?.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Ratio</span>
              <span className="font-medium">{ttmRatios.currentRatioTTM?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Debt/Equity</span>
              <span className="font-medium">{ttmRatios.debtToEquityRatioTTM?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Margin</span>
              <span className="font-medium">{(ttmRatios.grossProfitMarginTTM * 100)?.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net Margin</span>
              <span className="font-medium">{(ttmRatios.netProfitMarginTTM * 100)?.toFixed(2)}%</span>
            </div>
          </>
        )}
        
        {!ttmRatios && ttmMetrics && (
          // Fallback to metrics if ratios are not available
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">EV/EBITDA</span>
              <span className="font-medium">{ttmMetrics.evToEBITDATTM?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROE</span>
              <span className="font-medium">{(ttmMetrics.returnOnEquityTTM * 100)?.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROA</span>
              <span className="font-medium">{(ttmMetrics.returnOnAssetsTTM * 100)?.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Ratio</span>
              <span className="font-medium">{ttmMetrics.currentRatioTTM?.toFixed(2) || 'N/A'}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TTMRatioDisplay;

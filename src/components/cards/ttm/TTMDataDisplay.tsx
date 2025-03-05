
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { formatPercentage } from "@/lib/utils";
import { TTMData } from "@/types/financialDataTypes";

interface TTMDataDisplayProps {
  data: TTMData;
  className?: string;
}

const TTMDataDisplay: React.FC<TTMDataDisplayProps> = ({ data, className }) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">TTM (Latest 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">P/E Ratio</dt>
            <dd className="font-medium">{data.peRatio ? data.peRatio.toFixed(2) + 'x' : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">P/B Ratio</dt>
            <dd className="font-medium">{data.pbRatio ? data.pbRatio.toFixed(2) + 'x' : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ROE</dt>
            <dd className="font-medium">{data.roe !== undefined ? formatPercentage(data.roe * 100) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ROA</dt>
            <dd className="font-medium">{data.roa !== undefined ? formatPercentage(data.roa * 100) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Current Ratio</dt>
            <dd className="font-medium">{data.currentRatio ? data.currentRatio.toFixed(2) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Debt/Equity</dt>
            <dd className="font-medium">{data.debtToEquity ? data.debtToEquity.toFixed(2) + 'x' : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Gross Margin</dt>
            <dd className="font-medium">{data.grossMargin !== undefined ? formatPercentage(data.grossMargin * 100) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Net Margin</dt>
            <dd className="font-medium">{data.netMargin !== undefined ? formatPercentage(data.netMargin * 100) : 'N/A'}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default TTMDataDisplay;

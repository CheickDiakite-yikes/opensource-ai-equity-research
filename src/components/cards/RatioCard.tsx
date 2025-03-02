
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { formatMultiple, formatPercentage } from "@/lib/utils";

interface RatioData {
  year: string;
  peRatio?: number;
  pbRatio?: number;
  roe?: number;
  roa?: number;
  currentRatio?: number;
  debtToEquity?: number;
  grossMargin?: number;
  netMargin?: number;
}

interface RatioCardProps {
  data: RatioData;
}

const RatioCard: React.FC<RatioCardProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{data.year}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">P/E Ratio</dt>
            <dd className="font-medium">{data.peRatio ? formatMultiple(data.peRatio) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">P/B Ratio</dt>
            <dd className="font-medium">{data.pbRatio ? formatMultiple(data.pbRatio) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ROE</dt>
            <dd className="font-medium">{data.roe ? formatPercentage(data.roe * 100) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ROA</dt>
            <dd className="font-medium">{data.roa ? formatPercentage(data.roa * 100) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Current Ratio</dt>
            <dd className="font-medium">{data.currentRatio ? formatMultiple(data.currentRatio) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Debt/Equity</dt>
            <dd className="font-medium">{data.debtToEquity ? formatMultiple(data.debtToEquity) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Gross Margin</dt>
            <dd className="font-medium">{data.grossMargin ? formatPercentage(data.grossMargin * 100) : 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Net Margin</dt>
            <dd className="font-medium">{data.netMargin ? formatPercentage(data.netMargin * 100) : 'N/A'}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default RatioCard;

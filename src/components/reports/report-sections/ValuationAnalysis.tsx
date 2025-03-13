
import React from "react";
import { Card } from "@/components/ui/card";

interface ValuationAnalysisProps {
  valuationSummary: string;
  peRatio: string;
  pbRatio: string;
  evToEbitda: string;
  dividendYield: string;
  discountedCashFlow: string;
  priceForecast: string;
}

const ValuationAnalysis: React.FC<ValuationAnalysisProps> = ({
  valuationSummary,
  peRatio,
  pbRatio,
  evToEbitda,
  dividendYield,
  discountedCashFlow,
  priceForecast
}) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Valuation Summary</h3>
        <p className="text-sm text-muted-foreground">{valuationSummary}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Price-to-Earnings Ratio</h3>
        <p className="text-sm text-muted-foreground">{peRatio}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Price-to-Book Ratio</h3>
        <p className="text-sm text-muted-foreground">{pbRatio}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">EV/EBITDA</h3>
        <p className="text-sm text-muted-foreground">{evToEbitda}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Dividend Yield</h3>
        <p className="text-sm text-muted-foreground">{dividendYield}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Discounted Cash Flow</h3>
        <p className="text-sm text-muted-foreground">{discountedCashFlow}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Price Forecast</h3>
        <p className="text-sm text-muted-foreground">{priceForecast}</p>
      </Card>
    </div>
  );
};

export default ValuationAnalysis;


import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StockProfile, StockQuote } from "@/types/apiTypes";
import { IncomeStatement, BalanceSheet, CashFlowStatement, KeyRatio } from "@/types/financialStatementTypes";
import { formatCurrency } from "@/utils/financialDataUtils";

interface FinancialHighlightsProps {
  profile: StockProfile;
  quote: StockQuote;
  incomeStatements: IncomeStatement[];
  balanceSheets: BalanceSheet[];
  cashFlowStatements: CashFlowStatement[];
  keyRatios: KeyRatio[];
}

const FinancialHighlights: React.FC<FinancialHighlightsProps> = ({
  profile,
  quote,
  incomeStatements,
  balanceSheets,
  cashFlowStatements,
  keyRatios
}) => {
  // Get the most recent financial statements
  const latestIncome = incomeStatements[0];
  const latestBalance = balanceSheets[0];
  const latestCashFlow = cashFlowStatements[0];
  const latestRatios = keyRatios[0];

  // Previous year for YoY calculations
  const prevYearIncome = incomeStatements[1];
  
  // Calculate YoY growth rates
  const revenueGrowth = prevYearIncome
    ? ((latestIncome.revenue - prevYearIncome.revenue) / prevYearIncome.revenue) * 100
    : 0;
  
  const netIncomeGrowth = prevYearIncome
    ? ((latestIncome.netIncome - prevYearIncome.netIncome) / prevYearIncome.netIncome) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Revenue (TTM)</div>
            <div className="text-2xl font-semibold">
              {formatCurrency(latestIncome.revenue, true)}
            </div>
            <div className={`text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueGrowth.toFixed(1)}% YoY
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Net Income (TTM)</div>
            <div className="text-2xl font-semibold">
              {formatCurrency(latestIncome.netIncome, true)}
            </div>
            <div className={`text-sm ${netIncomeGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netIncomeGrowth.toFixed(1)}% YoY
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Operating Cash Flow (TTM)</div>
            <div className="text-2xl font-semibold">
              {formatCurrency(latestCashFlow.netCashProvidedByOperatingActivities, true)}
            </div>
            <div className="text-sm">
              {((latestCashFlow.netCashProvidedByOperatingActivities / latestIncome.revenue) * 100).toFixed(1)}% of Revenue
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">ROE (TTM)</div>
            <div className="text-2xl font-semibold">
              {(latestRatios?.returnOnEquity * 100 || 0).toFixed(1)}%
            </div>
            <div className="text-sm">
              Net Margin: {(latestRatios?.netProfitMargin * 100 || 0).toFixed(1)}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialHighlights;

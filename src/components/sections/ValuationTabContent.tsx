
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockProfile, StockQuote } from "@/types/apiTypes";
import { IncomeStatement, BalanceSheet, CashFlowStatement } from "@/types/financialStatementTypes";
import { formatCurrency } from "@/utils/financialDataUtils";

interface ValuationTabContentProps {
  profile: StockProfile;
  quote: StockQuote;
  incomeStatements: IncomeStatement[];
  balanceSheets: BalanceSheet[];
  cashFlowStatements: CashFlowStatement[];
}

const ValuationTabContent: React.FC<ValuationTabContentProps> = ({
  profile,
  quote,
  incomeStatements,
  balanceSheets,
  cashFlowStatements,
}) => {
  // Get latest statements
  const latestIncome = incomeStatements[0];
  const latestCashFlow = cashFlowStatements[0];
  
  // Calculate common valuation metrics
  const pe = quote.price / (latestIncome.eps || 1);
  const ps = quote.marketCap / latestIncome.revenue;
  const pfcf = quote.marketCap / (latestCashFlow.freeCashFlow || 1);
  
  // Enterprise Value (simplified)
  const totalDebt = balanceSheets[0].totalDebt || 0;
  const cash = balanceSheets[0].cashAndCashEquivalents || 0;
  const enterpriseValue = quote.marketCap + totalDebt - cash;
  
  // EV/EBITDA
  const evToEbitda = enterpriseValue / (latestIncome.ebitda || 1);
  
  // EV/Revenue
  const evToRevenue = enterpriseValue / latestIncome.revenue;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">P/E Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pe.toFixed(2)}x</p>
            <p className="text-sm text-muted-foreground">
              Price to Earnings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">P/S Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{ps.toFixed(2)}x</p>
            <p className="text-sm text-muted-foreground">
              Price to Sales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">P/FCF Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pfcf.toFixed(2)}x</p>
            <p className="text-sm text-muted-foreground">
              Price to Free Cash Flow
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">EV/EBITDA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{evToEbitda.toFixed(2)}x</p>
            <p className="text-sm text-muted-foreground">
              Enterprise Value to EBITDA
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">EV/Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{evToRevenue.toFixed(2)}x</p>
            <p className="text-sm text-muted-foreground">
              Enterprise Value to Revenue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Enterprise Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(enterpriseValue, true)}</p>
            <p className="text-sm text-muted-foreground">
              Market Cap + Debt - Cash
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Valuation Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            This section would typically compare the company's valuation metrics against:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>Industry averages</li>
            <li>Sector averages</li>
            <li>Market averages</li>
            <li>Historical averages</li>
            <li>Key competitors</li>
          </ul>
          <p className="text-sm mt-4 text-muted-foreground">
            Full comparison data would be integrated from financial data providers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValuationTabContent;

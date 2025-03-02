
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/financialDataUtils";
import { IncomeStatement } from "@/types/financialStatementTypes";

interface IncomeStatementTableProps {
  incomeStatements: IncomeStatement[];
}

const IncomeStatementTable: React.FC<IncomeStatementTableProps> = ({ incomeStatements }) => {
  // Sort statements by date (newest first)
  const sortedStatements = [...incomeStatements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Convert to year strings for display
  const data = sortedStatements.map(statement => ({
    year: new Date(statement.date).getFullYear().toString(),
    revenue: statement.revenue,
    costOfRevenue: statement.costOfRevenue || 0,
    grossProfit: statement.grossProfit,
    operatingExpenses: statement.operatingExpenses || 0,
    operatingIncome: statement.operatingIncome || 0,
    netIncome: statement.netIncome,
    eps: statement.eps || 0
  }));
  
  // Set consistent denomination for this table
  const denomination = 'millions';
  
  const formatValue = (value: number) => {
    return formatCurrency(value / 1000000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Statement Trends</CardTitle>
      </CardHeader>
      <div className="px-4 overflow-auto">
        <table className="w-full financial-table">
          <thead>
            <tr>
              <th colSpan={data.length + 1} className="text-left text-sm text-muted-foreground pb-2">
                (All figures in $millions)
              </th>
            </tr>
            <tr className="border-b">
              <th className="text-left">Metric</th>
              {data.map((item) => (
                <th key={item.year} className="text-right">{item.year}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Revenue</td>
              {data.map((item) => (
                <td key={`revenue-${item.year}`} className="text-right">
                  {formatValue(item.revenue)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Cost of Revenue</td>
              {data.map((item) => (
                <td key={`costOfRevenue-${item.year}`} className="text-right">
                  {formatValue(item.costOfRevenue)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Gross Profit</td>
              {data.map((item) => (
                <td key={`grossProfit-${item.year}`} className="text-right">
                  {formatValue(item.grossProfit)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Operating Expenses</td>
              {data.map((item) => (
                <td key={`operatingExpenses-${item.year}`} className="text-right">
                  {formatValue(item.operatingExpenses)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Operating Income</td>
              {data.map((item) => (
                <td key={`operatingIncome-${item.year}`} className="text-right">
                  {formatValue(item.operatingIncome)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Net Income</td>
              {data.map((item) => (
                <td key={`netIncome-${item.year}`} className="text-right">
                  {formatValue(item.netIncome)}
                </td>
              ))}
            </tr>
            <tr>
              <td>EPS</td>
              {data.map((item) => (
                <td key={`eps-${item.year}`} className="text-right">
                  ${item.eps.toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default IncomeStatementTable;

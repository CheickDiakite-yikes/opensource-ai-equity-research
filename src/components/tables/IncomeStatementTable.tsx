
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFinancialTableValue } from "@/lib/utils";

interface FinancialDataItem {
  year: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
}

interface IncomeStatementTableProps {
  data: FinancialDataItem[];
}

const IncomeStatementTable: React.FC<IncomeStatementTableProps> = ({ data }) => {
  // Set consistent denomination for this table
  const denomination = 'millions';
  
  // Sort data by year in ascending order (oldest to newest)
  const sortedData = [...data].sort((a, b) => {
    return parseInt(a.year) - parseInt(b.year);
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Statement Trends</CardTitle>
      </CardHeader>
      <div className="px-4 overflow-auto">
        <table className="w-full financial-table">
          <thead>
            <tr>
              <th colSpan={sortedData.length + 1} className="text-left text-sm text-muted-foreground pb-2">
                (All figures in $millions)
              </th>
            </tr>
            <tr className="border-b">
              <th className="text-left">Metric</th>
              {sortedData.map((item) => (
                <th key={item.year} className="text-right">{item.year}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Revenue</td>
              {sortedData.map((item) => (
                <td key={`revenue-${item.year}`} className="text-right">
                  {formatFinancialTableValue(item.revenue, denomination)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Cost of Revenue</td>
              {sortedData.map((item) => (
                <td key={`costOfRevenue-${item.year}`} className="text-right">
                  {formatFinancialTableValue(item.costOfRevenue, denomination)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Gross Profit</td>
              {sortedData.map((item) => (
                <td key={`grossProfit-${item.year}`} className="text-right">
                  {formatFinancialTableValue(item.grossProfit, denomination)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Operating Expenses</td>
              {sortedData.map((item) => (
                <td key={`operatingExpenses-${item.year}`} className="text-right">
                  {formatFinancialTableValue(item.operatingExpenses, denomination)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Operating Income</td>
              {sortedData.map((item) => (
                <td key={`operatingIncome-${item.year}`} className="text-right">
                  {formatFinancialTableValue(item.operatingIncome, denomination)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Net Income</td>
              {sortedData.map((item) => (
                <td key={`netIncome-${item.year}`} className="text-right">
                  {formatFinancialTableValue(item.netIncome, denomination)}
                </td>
              ))}
            </tr>
            <tr>
              <td>EPS</td>
              {sortedData.map((item) => (
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

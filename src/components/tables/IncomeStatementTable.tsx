
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Statement Trends</CardTitle>
      </CardHeader>
      <div className="px-4 overflow-auto">
        <table className="w-full financial-table">
          <thead>
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
                  {formatCurrency(item.revenue)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Cost of Revenue</td>
              {data.map((item) => (
                <td key={`costOfRevenue-${item.year}`} className="text-right">
                  {formatCurrency(item.costOfRevenue)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Gross Profit</td>
              {data.map((item) => (
                <td key={`grossProfit-${item.year}`} className="text-right">
                  {formatCurrency(item.grossProfit)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Operating Expenses</td>
              {data.map((item) => (
                <td key={`operatingExpenses-${item.year}`} className="text-right">
                  {formatCurrency(item.operatingExpenses)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Operating Income</td>
              {data.map((item) => (
                <td key={`operatingIncome-${item.year}`} className="text-right">
                  {formatCurrency(item.operatingIncome)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Net Income</td>
              {data.map((item) => (
                <td key={`netIncome-${item.year}`} className="text-right">
                  {formatCurrency(item.netIncome)}
                </td>
              ))}
            </tr>
            <tr>
              <td>EPS</td>
              {data.map((item) => (
                <td key={`eps-${item.year}`} className="text-right">
                  {item.eps.toFixed(2)}
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

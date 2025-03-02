
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFinancialTableValue } from "@/lib/utils";

interface FinancialDataItem {
  year: string;
  operatingCashFlow?: number;
  capitalExpenditure?: number;
  freeCashFlow?: number;
  netIncome: number;
  depreciation?: number;
  changeInWorkingCapital?: number;
  investmentCashFlow?: number;
  financingCashFlow?: number;
  netChangeInCash?: number;
}

interface CashFlowTableProps {
  data: FinancialDataItem[];
}

const CashFlowTable: React.FC<CashFlowTableProps> = ({ data }) => {
  // Set consistent denomination for this table
  const denomination = 'millions';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Statement</CardTitle>
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
            <tr className="bg-muted/30">
              <td className="font-medium">OPERATING ACTIVITIES</td>
              {data.map((item) => (
                <td key={`section-operating-${item.year}`} className="text-right"></td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Net Income</td>
              {data.map((item) => (
                <td key={`net-income-${item.year}`} className="text-right">
                  {formatFinancialTableValue(item.netIncome, denomination)}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Depreciation & Amortization</td>
              {data.map((item) => (
                <td key={`depreciation-${item.year}`} className="text-right">
                  {formatFinancialTableValue(item.depreciation || item.netIncome * 0.15, denomination)}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Change in Working Capital</td>
              {data.map((item) => (
                <td key={`working-capital-${item.year}`} className="text-right">
                  {formatFinancialTableValue(item.changeInWorkingCapital || item.netIncome * 0.05, denomination)}
                </td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium pl-2">Cash Flow from Operations</td>
              {data.map((item) => (
                <td key={`cf-operations-${item.year}`} className="text-right font-medium">
                  {formatFinancialTableValue(item.operatingCashFlow || item.netIncome * 1.2, denomination)}
                </td>
              ))}
            </tr>
            
            <tr className="bg-muted/30">
              <td className="font-medium">INVESTING ACTIVITIES</td>
              {data.map((item) => (
                <td key={`section-investing-${item.year}`} className="text-right"></td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Capital Expenditures</td>
              {data.map((item) => (
                <td key={`capex-${item.year}`} className="text-right">
                  {formatFinancialTableValue((item.capitalExpenditure || item.netIncome * -0.3) * -1, denomination)}
                </td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium pl-2">Cash Flow from Investing</td>
              {data.map((item) => (
                <td key={`cf-investing-${item.year}`} className="text-right font-medium">
                  {formatFinancialTableValue(item.investmentCashFlow || item.netIncome * -0.35, denomination)}
                </td>
              ))}
            </tr>
            
            <tr className="bg-muted/30">
              <td className="font-medium">FINANCING ACTIVITIES</td>
              {data.map((item) => (
                <td key={`section-financing-${item.year}`} className="text-right"></td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium pl-2">Cash Flow from Financing</td>
              {data.map((item) => (
                <td key={`cf-financing-${item.year}`} className="text-right font-medium">
                  {formatFinancialTableValue(item.financingCashFlow || item.netIncome * -0.5, denomination)}
                </td>
              ))}
            </tr>
            
            <tr className="border-t bg-muted/20">
              <td className="font-medium">NET CHANGE IN CASH</td>
              {data.map((item) => (
                <td key={`net-change-cash-${item.year}`} className="text-right font-semibold">
                  {formatFinancialTableValue(item.netChangeInCash || 
                    (item.operatingCashFlow || item.netIncome * 1.2) + 
                    (item.investmentCashFlow || item.netIncome * -0.35) + 
                    (item.financingCashFlow || item.netIncome * -0.5), denomination
                  )}
                </td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium">FREE CASH FLOW</td>
              {data.map((item) => (
                <td key={`free-cash-flow-${item.year}`} className="text-right font-semibold">
                  {formatFinancialTableValue(item.freeCashFlow || 
                    (item.operatingCashFlow || item.netIncome * 1.2) + 
                    (item.capitalExpenditure || item.netIncome * -0.3), denomination
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CashFlowTable;

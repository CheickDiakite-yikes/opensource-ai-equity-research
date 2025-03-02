
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface FinancialDataItem {
  year: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  cashAndCashEquivalents?: number;
  shortTermInvestments?: number;
  accountsReceivable?: number;
  inventory?: number;
  totalCurrentAssets?: number;
  propertyPlantEquipment?: number;
  longTermInvestments?: number;
  intangibleAssets?: number;
  totalNonCurrentAssets?: number;
  accountsPayable?: number;
  shortTermDebt?: number;
  totalCurrentLiabilities?: number;
  longTermDebt?: number;
  totalNonCurrentLiabilities?: number;
}

interface BalanceSheetTableProps {
  data: FinancialDataItem[];
}

const BalanceSheetTable: React.FC<BalanceSheetTableProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Sheet Summary</CardTitle>
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
            <tr className="bg-muted/30">
              <td className="font-medium">ASSETS</td>
              {data.map((item) => (
                <td key={`section-assets-${item.year}`} className="text-right"></td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Cash & Equivalents</td>
              {data.map((item) => (
                <td key={`cash-${item.year}`} className="text-right">
                  {formatCurrency(item.cashAndCashEquivalents || 0)}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Short-Term Investments</td>
              {data.map((item) => (
                <td key={`short-investments-${item.year}`} className="text-right">
                  {formatCurrency(item.shortTermInvestments || 0)}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Accounts Receivable</td>
              {data.map((item) => (
                <td key={`receivables-${item.year}`} className="text-right">
                  {formatCurrency(item.accountsReceivable || 0)}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Inventory</td>
              {data.map((item) => (
                <td key={`inventory-${item.year}`} className="text-right">
                  {formatCurrency(item.inventory || 0)}
                </td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium pl-2">Total Current Assets</td>
              {data.map((item) => (
                <td key={`total-current-assets-${item.year}`} className="text-right font-medium">
                  {formatCurrency(item.totalCurrentAssets || 0)}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Property, Plant & Equipment</td>
              {data.map((item) => (
                <td key={`ppe-${item.year}`} className="text-right">
                  {formatCurrency(item.propertyPlantEquipment || 0)}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Long-Term Investments</td>
              {data.map((item) => (
                <td key={`long-investments-${item.year}`} className="text-right">
                  {formatCurrency(item.longTermInvestments || 0)}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Intangible Assets</td>
              {data.map((item) => (
                <td key={`intangibles-${item.year}`} className="text-right">
                  {formatCurrency(item.intangibleAssets || 0)}
                </td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium pl-2">Total Non-Current Assets</td>
              {data.map((item) => (
                <td key={`total-non-current-assets-${item.year}`} className="text-right font-medium">
                  {formatCurrency(item.totalNonCurrentAssets || 0)}
                </td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium">TOTAL ASSETS</td>
              {data.map((item) => (
                <td key={`total-assets-${item.year}`} className="text-right font-semibold">
                  {formatCurrency(item.totalAssets)}
                </td>
              ))}
            </tr>
            
            <tr className="bg-muted/30">
              <td className="font-medium">LIABILITIES</td>
              {data.map((item) => (
                <td key={`section-liabilities-${item.year}`} className="text-right"></td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Accounts Payable</td>
              {data.map((item) => (
                <td key={`payables-${item.year}`} className="text-right">
                  {formatCurrency(item.accountsPayable || 0)}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Short-Term Debt</td>
              {data.map((item) => (
                <td key={`short-debt-${item.year}`} className="text-right">
                  {formatCurrency(item.shortTermDebt || 0)}
                </td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium pl-2">Total Current Liabilities</td>
              {data.map((item) => (
                <td key={`total-current-liabilities-${item.year}`} className="text-right font-medium">
                  {formatCurrency(item.totalCurrentLiabilities || 0)}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="pl-4">Long-Term Debt</td>
              {data.map((item) => (
                <td key={`long-debt-${item.year}`} className="text-right">
                  {formatCurrency(item.longTermDebt || 0)}
                </td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium pl-2">Total Non-Current Liabilities</td>
              {data.map((item) => (
                <td key={`total-non-current-liabilities-${item.year}`} className="text-right font-medium">
                  {formatCurrency(item.totalNonCurrentLiabilities || 0)}
                </td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium">TOTAL LIABILITIES</td>
              {data.map((item) => (
                <td key={`total-liabilities-${item.year}`} className="text-right font-semibold">
                  {formatCurrency(item.totalLiabilities)}
                </td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium">TOTAL EQUITY</td>
              {data.map((item) => (
                <td key={`total-equity-${item.year}`} className="text-right font-semibold">
                  {formatCurrency(item.totalEquity)}
                </td>
              ))}
            </tr>
            
            <tr className="border-t">
              <td className="font-medium">TOTAL LIABILITIES & EQUITY</td>
              {data.map((item) => (
                <td key={`total-liabilities-equity-${item.year}`} className="text-right font-semibold">
                  {formatCurrency(item.totalLiabilities + item.totalEquity)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default BalanceSheetTable;

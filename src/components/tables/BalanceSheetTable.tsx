
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BalanceSheet } from "@/types/financialStatementTypes";
import { formatCurrency } from "@/utils/financialDataUtils";

interface BalanceSheetTableProps {
  balanceSheets: BalanceSheet[];
}

const BalanceSheetTable: React.FC<BalanceSheetTableProps> = ({ balanceSheets }) => {
  // Sort statements by date (newest first)
  const sortedSheets = [...balanceSheets].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Convert to data format for display
  const data = sortedSheets.map(sheet => ({
    year: new Date(sheet.date).getFullYear().toString(),
    totalAssets: sheet.totalAssets,
    totalLiabilities: sheet.totalLiabilities,
    totalEquity: sheet.totalStockholdersEquity,
    cashAndCashEquivalents: sheet.cashAndCashEquivalents || 0,
    shortTermInvestments: sheet.shortTermInvestments || 0,
    accountsReceivable: sheet.netReceivables || 0,
    inventory: sheet.inventory || 0,
    totalCurrentAssets: sheet.totalCurrentAssets || 0,
    propertyPlantEquipment: sheet.propertyPlantEquipmentNet || 0,
    longTermInvestments: sheet.longTermInvestments || 0,
    intangibleAssets: sheet.intangibleAssets || 0,
    totalNonCurrentAssets: sheet.totalNonCurrentAssets || 0,
    accountsPayable: sheet.accountPayables || 0,
    shortTermDebt: sheet.shortTermDebt || 0,
    totalCurrentLiabilities: sheet.totalCurrentLiabilities || 0,
    longTermDebt: sheet.longTermDebt || 0,
    totalNonCurrentLiabilities: sheet.totalNonCurrentLiabilities || 0
  }));

  // Set consistent denomination for this table
  const denomination = 'millions';
  
  const formatValue = (value: number) => {
    return formatCurrency(value / 1000000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Sheet Summary</CardTitle>
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
              <th className="text-left">Item</th>
              {data.map((item) => (
                <th key={item.year} className="text-right">{item.year}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Assets Section */}
            <tr className="bg-muted/50">
              <td colSpan={data.length + 1} className="font-medium">Assets</td>
            </tr>
            <tr>
              <td className="pl-4">Cash & Cash Equivalents</td>
              {data.map((item) => (
                <td key={`cash-${item.year}`} className="text-right">
                  {formatValue(item.cashAndCashEquivalents)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="pl-4">Total Current Assets</td>
              {data.map((item) => (
                <td key={`currentAssets-${item.year}`} className="text-right">
                  {formatValue(item.totalCurrentAssets)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="pl-4">Total Non-Current Assets</td>
              {data.map((item) => (
                <td key={`nonCurrentAssets-${item.year}`} className="text-right">
                  {formatValue(item.totalNonCurrentAssets)}
                </td>
              ))}
            </tr>
            <tr className="font-medium">
              <td>Total Assets</td>
              {data.map((item) => (
                <td key={`totalAssets-${item.year}`} className="text-right">
                  {formatValue(item.totalAssets)}
                </td>
              ))}
            </tr>
            
            {/* Liabilities Section */}
            <tr className="bg-muted/50">
              <td colSpan={data.length + 1} className="font-medium">Liabilities</td>
            </tr>
            <tr>
              <td className="pl-4">Total Current Liabilities</td>
              {data.map((item) => (
                <td key={`currentLiabilities-${item.year}`} className="text-right">
                  {formatValue(item.totalCurrentLiabilities)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="pl-4">Total Non-Current Liabilities</td>
              {data.map((item) => (
                <td key={`nonCurrentLiabilities-${item.year}`} className="text-right">
                  {formatValue(item.totalNonCurrentLiabilities)}
                </td>
              ))}
            </tr>
            <tr className="font-medium">
              <td>Total Liabilities</td>
              {data.map((item) => (
                <td key={`totalLiabilities-${item.year}`} className="text-right">
                  {formatValue(item.totalLiabilities)}
                </td>
              ))}
            </tr>
            
            {/* Equity Section */}
            <tr className="bg-muted/50">
              <td colSpan={data.length + 1} className="font-medium">Stockholders' Equity</td>
            </tr>
            <tr className="font-medium">
              <td>Total Stockholders' Equity</td>
              {data.map((item) => (
                <td key={`totalEquity-${item.year}`} className="text-right">
                  {formatValue(item.totalEquity)}
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

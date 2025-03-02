
import React from "react";
import { FinancialDataItem } from "@/types/balanceSheetTypes";
import { formatFinancialTableValue } from "@/lib/utils";

interface AssetsSectionProps {
  data: FinancialDataItem[];
  denomination?: 'millions' | 'billions' | 'thousands';
}

const AssetsSection: React.FC<AssetsSectionProps> = ({ data, denomination = 'millions' }) => {
  return (
    <>
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
            {formatFinancialTableValue(item.cashAndCashEquivalents || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr>
        <td className="pl-4">Short-Term Investments</td>
        {data.map((item) => (
          <td key={`short-investments-${item.year}`} className="text-right">
            {formatFinancialTableValue(item.shortTermInvestments || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr>
        <td className="pl-4">Accounts Receivable</td>
        {data.map((item) => (
          <td key={`receivables-${item.year}`} className="text-right">
            {formatFinancialTableValue(item.accountsReceivable || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr>
        <td className="pl-4">Inventory</td>
        {data.map((item) => (
          <td key={`inventory-${item.year}`} className="text-right">
            {formatFinancialTableValue(item.inventory || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr className="border-t">
        <td className="font-medium pl-2">Total Current Assets</td>
        {data.map((item) => (
          <td key={`total-current-assets-${item.year}`} className="text-right font-medium">
            {formatFinancialTableValue(item.totalCurrentAssets || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr>
        <td className="pl-4">Property, Plant & Equipment</td>
        {data.map((item) => (
          <td key={`ppe-${item.year}`} className="text-right">
            {formatFinancialTableValue(item.propertyPlantEquipment || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr>
        <td className="pl-4">Long-Term Investments</td>
        {data.map((item) => (
          <td key={`long-investments-${item.year}`} className="text-right">
            {formatFinancialTableValue(item.longTermInvestments || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr>
        <td className="pl-4">Intangible Assets</td>
        {data.map((item) => (
          <td key={`intangibles-${item.year}`} className="text-right">
            {formatFinancialTableValue(item.intangibleAssets || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr className="border-t">
        <td className="font-medium pl-2">Total Non-Current Assets</td>
        {data.map((item) => (
          <td key={`total-non-current-assets-${item.year}`} className="text-right font-medium">
            {formatFinancialTableValue(item.totalNonCurrentAssets || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr className="border-t">
        <td className="font-medium">TOTAL ASSETS</td>
        {data.map((item) => (
          <td key={`total-assets-${item.year}`} className="text-right font-semibold">
            {formatFinancialTableValue(item.totalAssets, denomination)}
          </td>
        ))}
      </tr>
    </>
  );
};

export default AssetsSection;

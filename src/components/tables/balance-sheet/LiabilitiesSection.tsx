
import React from "react";
import { FinancialDataItem } from "@/types/balanceSheetTypes";
import { formatFinancialTableValue } from "@/lib/utils";

interface LiabilitiesSectionProps {
  data: FinancialDataItem[];
  denomination?: 'millions' | 'billions' | 'thousands';
}

const LiabilitiesSection: React.FC<LiabilitiesSectionProps> = ({ data, denomination = 'millions' }) => {
  return (
    <>
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
            {formatFinancialTableValue(item.accountsPayable || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr>
        <td className="pl-4">Short-Term Debt</td>
        {data.map((item) => (
          <td key={`short-debt-${item.year}`} className="text-right">
            {formatFinancialTableValue(item.shortTermDebt || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr className="border-t">
        <td className="font-medium pl-2">Total Current Liabilities</td>
        {data.map((item) => (
          <td key={`total-current-liabilities-${item.year}`} className="text-right font-medium">
            {formatFinancialTableValue(item.totalCurrentLiabilities || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr>
        <td className="pl-4">Long-Term Debt</td>
        {data.map((item) => (
          <td key={`long-debt-${item.year}`} className="text-right">
            {formatFinancialTableValue(item.longTermDebt || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr className="border-t">
        <td className="font-medium pl-2">Total Non-Current Liabilities</td>
        {data.map((item) => (
          <td key={`total-non-current-liabilities-${item.year}`} className="text-right font-medium">
            {formatFinancialTableValue(item.totalNonCurrentLiabilities || 0, denomination)}
          </td>
        ))}
      </tr>
      
      <tr className="border-t">
        <td className="font-medium">TOTAL LIABILITIES</td>
        {data.map((item) => (
          <td key={`total-liabilities-${item.year}`} className="text-right font-semibold">
            {formatFinancialTableValue(item.totalLiabilities, denomination)}
          </td>
        ))}
      </tr>
    </>
  );
};

export default LiabilitiesSection;

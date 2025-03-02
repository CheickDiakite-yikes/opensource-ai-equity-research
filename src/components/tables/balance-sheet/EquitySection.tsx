
import React from "react";
import { FinancialDataItem } from "@/types/balanceSheetTypes";
import { formatFinancialTableValue } from "@/lib/utils";

interface EquitySectionProps {
  data: FinancialDataItem[];
  denomination?: 'millions' | 'billions' | 'thousands';
}

const EquitySection: React.FC<EquitySectionProps> = ({ data, denomination = 'millions' }) => {
  return (
    <>
      <tr className="border-t">
        <td className="font-medium">TOTAL EQUITY</td>
        {data.map((item) => (
          <td key={`total-equity-${item.year}`} className="text-right font-semibold">
            {formatFinancialTableValue(item.totalEquity, denomination)}
          </td>
        ))}
      </tr>
      
      <tr className="border-t">
        <td className="font-medium">TOTAL LIABILITIES & EQUITY</td>
        {data.map((item) => (
          <td key={`total-liabilities-equity-${item.year}`} className="text-right font-semibold">
            {formatFinancialTableValue(item.totalLiabilities + item.totalEquity, denomination)}
          </td>
        ))}
      </tr>
    </>
  );
};

export default EquitySection;

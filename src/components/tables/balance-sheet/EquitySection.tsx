
import React from "react";
import { FinancialDataItem } from "@/types/balanceSheetTypes";
import { formatFinancialTableValue } from "@/lib/utils";

interface EquitySectionProps {
  data: FinancialDataItem[];
}

const EquitySection: React.FC<EquitySectionProps> = ({ data }) => {
  return (
    <>
      <tr className="border-t">
        <td className="font-medium">TOTAL EQUITY</td>
        {data.map((item) => (
          <td key={`total-equity-${item.year}`} className="text-right font-semibold">
            {formatFinancialTableValue(item.totalEquity)}
          </td>
        ))}
      </tr>
      
      <tr className="border-t">
        <td className="font-medium">TOTAL LIABILITIES & EQUITY</td>
        {data.map((item) => (
          <td key={`total-liabilities-equity-${item.year}`} className="text-right font-semibold">
            {formatFinancialTableValue(item.totalLiabilities + item.totalEquity)}
          </td>
        ))}
      </tr>
    </>
  );
};

export default EquitySection;


import React from "react";
import { FinancialDataItem } from "@/types/balanceSheetTypes";

interface TableHeaderProps {
  data: FinancialDataItem[];
  denomination?: 'millions' | 'billions' | 'thousands';
}

const TableHeader: React.FC<TableHeaderProps> = ({ data, denomination = 'millions' }) => {
  // Determine the suffix based on denomination
  let denominationText = "millions";
  if (denomination === 'billions') {
    denominationText = "billions";
  } else if (denomination === 'thousands') {
    denominationText = "thousands";
  }

  return (
    <thead>
      <tr>
        <th colSpan={data.length + 1} className="text-left text-sm text-muted-foreground pb-2">
          (All figures in ${denominationText})
        </th>
      </tr>
      <tr className="border-b">
        <th className="text-left">Metric</th>
        {data.map((item) => (
          <th key={item.year} className="text-right">{item.year}</th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;

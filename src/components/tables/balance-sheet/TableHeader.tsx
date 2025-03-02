
import React from "react";
import { FinancialDataItem } from "@/types/balanceSheetTypes";

interface TableHeaderProps {
  data: FinancialDataItem[];
}

const TableHeader: React.FC<TableHeaderProps> = ({ data }) => {
  return (
    <thead>
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

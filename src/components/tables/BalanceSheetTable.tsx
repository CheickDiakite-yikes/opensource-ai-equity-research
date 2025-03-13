
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BalanceSheetTableProps } from "@/types/balanceSheetTypes";
import TableHeader from "./balance-sheet/TableHeader";
import AssetsSection from "./balance-sheet/AssetsSection";
import LiabilitiesSection from "./balance-sheet/LiabilitiesSection";
import EquitySection from "./balance-sheet/EquitySection";

const BalanceSheetTable: React.FC<BalanceSheetTableProps> = ({ data }) => {
  // Set consistent denomination for this table
  const denomination = 'millions';
  
  // Sort data by year in ascending order (oldest to newest)
  const sortedData = [...data].sort((a, b) => {
    return parseInt(a.year) - parseInt(b.year);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Sheet Summary</CardTitle>
      </CardHeader>
      <div className="px-4 overflow-auto">
        <table className="w-full financial-table">
          <TableHeader data={sortedData} denomination={denomination} />
          <tbody>
            <AssetsSection data={sortedData} denomination={denomination} />
            <LiabilitiesSection data={sortedData} denomination={denomination} />
            <EquitySection data={sortedData} denomination={denomination} />
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default BalanceSheetTable;

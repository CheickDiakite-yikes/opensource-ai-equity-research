
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BalanceSheetTableProps } from "@/types/balanceSheetTypes";
import TableHeader from "./balance-sheet/TableHeader";
import AssetsSection from "./balance-sheet/AssetsSection";
import LiabilitiesSection from "./balance-sheet/LiabilitiesSection";
import EquitySection from "./balance-sheet/EquitySection";

const BalanceSheetTable: React.FC<BalanceSheetTableProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Sheet Summary</CardTitle>
      </CardHeader>
      <div className="px-4 overflow-auto">
        <table className="w-full financial-table">
          <TableHeader data={data} />
          <tbody>
            <AssetsSection data={data} />
            <LiabilitiesSection data={data} />
            <EquitySection data={data} />
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default BalanceSheetTable;

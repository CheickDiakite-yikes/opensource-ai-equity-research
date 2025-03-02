
import React from "react";
import { Card } from "@/components/ui/card";
import AssetsLiabilitiesChart from "@/components/charts/AssetsLiabilitiesChart";
import BalanceSheetTable from "@/components/tables/BalanceSheetTable";

interface BalanceSheetTabContentProps {
  financials: any[];
}

const BalanceSheetTabContent: React.FC<BalanceSheetTabContentProps> = ({ financials }) => {
  return (
    <div className="mt-4 space-y-6">
      <AssetsLiabilitiesChart data={financials} />
      <BalanceSheetTable data={financials} />
    </div>
  );
};

export default BalanceSheetTabContent;

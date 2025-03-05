
import React from "react";
import AssetsLiabilitiesChart from "@/components/charts/AssetsLiabilitiesChart";
import BalanceSheetTable from "@/components/tables/BalanceSheetTable";

interface BalanceSheetTabContentProps {
  financials: any[];
}

const BalanceSheetTabContent: React.FC<BalanceSheetTabContentProps> = ({ financials }) => {
  // Sort financials by year in ascending order (oldest to newest)
  const sortedFinancials = [...financials].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="mt-4 space-y-6">
      <AssetsLiabilitiesChart data={sortedFinancials} />
      <BalanceSheetTable data={sortedFinancials} />
    </div>
  );
};

export default BalanceSheetTabContent;

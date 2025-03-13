
import React from "react";
import CashFlowChart from "@/components/charts/CashFlowChart";
import CashFlowTable from "@/components/tables/CashFlowTable";

interface CashFlowTabContentProps {
  financials: any[];
}

const CashFlowTabContent: React.FC<CashFlowTabContentProps> = ({ financials }) => {
  // Sort financials by year in ascending order (oldest to newest)
  const sortedFinancials = [...financials].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="mt-4 space-y-6">
      <CashFlowChart data={sortedFinancials} />
      <CashFlowTable data={sortedFinancials} />
    </div>
  );
};

export default CashFlowTabContent;

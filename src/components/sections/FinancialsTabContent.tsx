
import React from "react";
import RevenueIncomeChart from "@/components/charts/RevenueIncomeChart";
import AssetsLiabilitiesChart from "@/components/charts/AssetsLiabilitiesChart";
import IncomeStatementTable from "@/components/tables/IncomeStatementTable";

interface FinancialsTabContentProps {
  financials: any[];
}

const FinancialsTabContent: React.FC<FinancialsTabContentProps> = ({ financials }) => {
  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueIncomeChart data={financials} />
        <AssetsLiabilitiesChart data={financials} />
      </div>
      
      <IncomeStatementTable data={financials} />
    </div>
  );
};

export default FinancialsTabContent;

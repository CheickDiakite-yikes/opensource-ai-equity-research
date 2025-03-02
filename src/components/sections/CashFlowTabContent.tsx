
import React from "react";
import { Card } from "@/components/ui/card";
import CashFlowChart from "@/components/charts/CashFlowChart";
import CashFlowTable from "@/components/tables/CashFlowTable";

interface CashFlowTabContentProps {
  financials: any[];
}

const CashFlowTabContent: React.FC<CashFlowTabContentProps> = ({ financials }) => {
  return (
    <div className="mt-4 space-y-6">
      <CashFlowChart data={financials} />
      <CashFlowTable data={financials} />
    </div>
  );
};

export default CashFlowTabContent;

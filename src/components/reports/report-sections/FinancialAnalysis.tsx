
import React from "react";
import { Card } from "@/components/ui/card";

interface FinancialAnalysisProps {
  financialSummary: string;
  revenueAnalysis: string;
  profitabilityAnalysis: string;
  balanceSheetAnalysis: string;
  cashFlowAnalysis: string;
}

const FinancialAnalysis: React.FC<FinancialAnalysisProps> = ({
  financialSummary,
  revenueAnalysis,
  profitabilityAnalysis,
  balanceSheetAnalysis,
  cashFlowAnalysis
}) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Financial Summary</h3>
        <p className="text-sm text-muted-foreground">{financialSummary}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Revenue Analysis</h3>
        <p className="text-sm text-muted-foreground">{revenueAnalysis}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Profitability Analysis</h3>
        <p className="text-sm text-muted-foreground">{profitabilityAnalysis}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Balance Sheet Analysis</h3>
        <p className="text-sm text-muted-foreground">{balanceSheetAnalysis}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Cash Flow Analysis</h3>
        <p className="text-sm text-muted-foreground">{cashFlowAnalysis}</p>
      </Card>
    </div>
  );
};

export default FinancialAnalysis;

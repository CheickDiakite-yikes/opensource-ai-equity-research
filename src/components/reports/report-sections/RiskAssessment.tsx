
import React from "react";
import { Card } from "@/components/ui/card";

interface RiskAssessmentProps {
  riskSummary: string;
  marketRisks: string;
  businessRisks: string;
  financialRisks: string;
  regulatoryRisks: string;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  riskSummary,
  marketRisks,
  businessRisks,
  financialRisks,
  regulatoryRisks
}) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Risk Summary</h3>
        <p className="text-sm text-muted-foreground">{riskSummary}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Market Risks</h3>
        <p className="text-sm text-muted-foreground">{marketRisks}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Business Risks</h3>
        <p className="text-sm text-muted-foreground">{businessRisks}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Financial Risks</h3>
        <p className="text-sm text-muted-foreground">{financialRisks}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Regulatory Risks</h3>
        <p className="text-sm text-muted-foreground">{regulatoryRisks}</p>
      </Card>
    </div>
  );
};

export default RiskAssessment;

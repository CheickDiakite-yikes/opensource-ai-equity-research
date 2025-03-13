
import React from "react";
import { Card } from "@/components/ui/card";

interface InvestmentAnalysisProps {
  investmentThesis: string;
  growthProspects: string;
  competitiveAdvantages: string;
  catalysts: string;
}

const InvestmentAnalysis: React.FC<InvestmentAnalysisProps> = ({
  investmentThesis,
  growthProspects,
  competitiveAdvantages,
  catalysts
}) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Investment Thesis</h3>
        <p className="text-sm text-muted-foreground">{investmentThesis}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Growth Prospects</h3>
        <p className="text-sm text-muted-foreground">{growthProspects}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Competitive Advantages</h3>
        <p className="text-sm text-muted-foreground">{competitiveAdvantages}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Key Catalysts</h3>
        <p className="text-sm text-muted-foreground">{catalysts}</p>
      </Card>
    </div>
  );
};

export default InvestmentAnalysis;

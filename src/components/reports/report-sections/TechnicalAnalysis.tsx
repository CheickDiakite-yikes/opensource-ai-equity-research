
import React from "react";
import { Card } from "@/components/ui/card";

interface TechnicalAnalysisProps {
  technicalSummary: string;
  trendAnalysis: string;
  supportResistanceLevels: string;
  movingAverages: string;
  relativeStrengthIndex: string;
  macdAnalysis: string;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({
  technicalSummary,
  trendAnalysis,
  supportResistanceLevels,
  movingAverages,
  relativeStrengthIndex,
  macdAnalysis
}) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Technical Summary</h3>
        <p className="text-sm text-muted-foreground">{technicalSummary}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
        <p className="text-sm text-muted-foreground">{trendAnalysis}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Support & Resistance Levels</h3>
        <p className="text-sm text-muted-foreground">{supportResistanceLevels}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Moving Averages</h3>
        <p className="text-sm text-muted-foreground">{movingAverages}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Relative Strength Index (RSI)</h3>
        <p className="text-sm text-muted-foreground">{relativeStrengthIndex}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">MACD Analysis</h3>
        <p className="text-sm text-muted-foreground">{macdAnalysis}</p>
      </Card>
    </div>
  );
};

export default TechnicalAnalysis;

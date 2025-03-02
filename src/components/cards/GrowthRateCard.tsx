
import React from "react";

interface GrowthRateCardProps {
  title: string;
  value: number;
  industryAvg: number;
  comparison: string;
}

const GrowthRateCard: React.FC<GrowthRateCardProps> = ({ 
  title, 
  value, 
  industryAvg, 
  comparison 
}) => {
  return (
    <div className="p-4 border rounded-lg">
      <span className="block text-sm text-muted-foreground mb-1">{title}</span>
      <span className="text-xl font-semibold block">
        {value.toFixed(2)}%
      </span>
      <span className="mt-1 text-xs text-green-600 block">
        {comparison}
      </span>
    </div>
  );
};

export default GrowthRateCard;

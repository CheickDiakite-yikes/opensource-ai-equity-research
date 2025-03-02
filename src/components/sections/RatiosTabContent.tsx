
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import RatioCard from "@/components/cards/RatioCard";
import ProfitabilityChart from "@/components/charts/ProfitabilityChart";

interface RatiosTabContentProps {
  ratioData: any[];
}

const RatiosTabContent: React.FC<RatiosTabContentProps> = ({ ratioData }) => {
  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ratioData.map((ratio, index) => (
          <RatioCard key={index} data={ratio} />
        ))}
      </div>
      
      <ProfitabilityChart data={ratioData} />
    </div>
  );
};

export default RatiosTabContent;

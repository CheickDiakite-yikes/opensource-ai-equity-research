
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import RatioCard from "@/components/cards/RatioCard";
import TTMCard from "@/components/cards/TTMCard";
import ProfitabilityChart from "@/components/charts/ProfitabilityChart";

interface RatiosTabContentProps {
  ratioData: any[];
  symbol?: string;
}

const RatiosTabContent: React.FC<RatiosTabContentProps> = ({ ratioData, symbol = "" }) => {
  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {ratioData.slice(0, 3).map((ratio, index) => (
          <RatioCard key={index} data={ratio} />
        ))}
        {symbol && <TTMCard symbol={symbol} />}
      </div>
      
      <ProfitabilityChart data={ratioData} />
    </div>
  );
};

export default RatiosTabContent;

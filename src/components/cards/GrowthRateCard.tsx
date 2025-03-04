
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface GrowthRateCardProps {
  title: string;
  cagr: number;
  yoy: number;
}

export const GrowthRateCard: React.FC<GrowthRateCardProps> = ({ title, cagr, yoy }) => {
  // Determine color based on CAGR value
  const cagrColor = cagr > 15 ? 'text-green-500' : 
                 cagr > 0 ? 'text-green-400' : 
                 cagr > -10 ? 'text-red-400' : 'text-red-500';
  
  // Determine color based on YoY value
  const yoyColor = yoy > 15 ? 'text-green-500' : 
                yoy > 0 ? 'text-green-400' : 
                yoy > -10 ? 'text-red-400' : 'text-red-500';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">5-Year CAGR</span>
            <span className={`text-lg font-bold ${cagrColor}`}>{cagr.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">YoY Growth</span>
            <span className={`text-lg font-bold ${yoyColor}`}>{yoy.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthRateCard;

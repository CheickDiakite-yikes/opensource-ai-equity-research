
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from '../ui/badge';

export interface GrowthInsightsCardProps {
  symbol: string;
  growth: Record<string, number>;
}

export const GrowthInsightsCard: React.FC<GrowthInsightsCardProps> = ({ symbol, growth }) => {
  // Determine overall growth trend
  const overallGrowth = Object.values(growth).reduce((sum, value) => sum + value, 0) / Object.values(growth).length;
  
  // Determine growth strength categories
  const getStrengthCategory = (value: number) => {
    if (value >= 25) return { label: 'Excellent', color: 'bg-green-500' };
    if (value >= 15) return { label: 'Strong', color: 'bg-green-400' };
    if (value >= 5) return { label: 'Good', color: 'bg-green-300' };
    if (value >= 0) return { label: 'Stable', color: 'bg-blue-300' };
    if (value >= -10) return { label: 'Weak', color: 'bg-yellow-300' };
    return { label: 'Poor', color: 'bg-red-400' };
  };
  
  const strengthCategory = getStrengthCategory(overallGrowth);
  
  // Get insights based on growth metrics
  const getInsights = () => {
    const insights = [];
    
    if (growth.revenue > 15 && growth.netIncome > 15) {
      insights.push(`${symbol} has shown strong growth in both revenue and profitability over the last 5 years.`);
    } else if (growth.revenue > 10 && growth.netIncome < 5) {
      insights.push(`${symbol} has good revenue growth but struggles to convert it to bottom-line profit growth.`);
    } else if (growth.revenue < 5 && growth.netIncome > 10) {
      insights.push(`${symbol} has improved profitability despite modest revenue growth, indicating improved efficiency.`);
    }
    
    if (growth.ebitda > growth.revenue && growth.ebitda > 10) {
      insights.push('Operating efficiency has improved over time with EBITDA outpacing revenue growth.');
    }
    
    if (growth.revenue < 0 && growth.netIncome < 0) {
      insights.push('Both revenue and profits are declining, suggesting business challenges.');
    }
    
    // Add generic insight if no specific ones are generated
    if (insights.length === 0) {
      if (overallGrowth > 10) {
        insights.push(`${symbol} has demonstrated solid overall growth metrics over the analyzed period.`);
      } else if (overallGrowth > 0) {
        insights.push(`${symbol} has shown modest but positive growth over the analyzed period.`);
      } else {
        insights.push(`${symbol} has faced growth challenges over the analyzed period.`);
      }
    }
    
    return insights;
  };
  
  const insights = getInsights();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Growth Insights</CardTitle>
          <Badge className={`${strengthCategory.color} text-white`}>
            {strengthCategory.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <p key={index} className="text-sm">
              {insight}
            </p>
          ))}
          
          <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-1">Growth Metrics (5-Year CAGR)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className={`text-sm font-bold ${growth.revenue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {growth.revenue.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-xs text-muted-foreground">Net Income</p>
                <p className={`text-sm font-bold ${growth.netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {growth.netIncome.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-xs text-muted-foreground">EBITDA</p>
                <p className={`text-sm font-bold ${growth.ebitda >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {growth.ebitda.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthInsightsCard;

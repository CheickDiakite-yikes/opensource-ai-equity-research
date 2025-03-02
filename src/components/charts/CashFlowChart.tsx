
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CashFlowChartProps {
  data: any[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  const chartData = [...data].reverse().map(item => {
    // Estimate values if not provided
    const operatingCashFlow = item.operatingCashFlow || item.netIncome * 1.2;
    const freeCashFlow = item.freeCashFlow || operatingCashFlow * 0.7;
    const investmentCashFlow = item.investmentCashFlow || item.netIncome * -0.35;
    
    return {
      year: item.year,
      "Operating Cash Flow": operatingCashFlow,
      "Free Cash Flow": freeCashFlow,
      "Investment Cash Flow": Math.abs(investmentCashFlow) * -1 // Make negative for visualization
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Trends</CardTitle>
      </CardHeader>
      <div className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000000000).toFixed(0)}B`}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend />
            <Bar dataKey="Operating Cash Flow" fill="#4f46e5" />
            <Bar dataKey="Free Cash Flow" fill="#10b981" />
            <Bar dataKey="Investment Cash Flow" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CashFlowChart;

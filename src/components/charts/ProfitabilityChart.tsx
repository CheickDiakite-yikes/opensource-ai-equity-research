
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfitabilityChartProps {
  data: Array<{
    year: string;
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
  }>;
}

const ProfitabilityChart: React.FC<ProfitabilityChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Profitability Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <Tooltip 
              formatter={(value: number) => [(value * 100).toFixed(2) + "%", ""]}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="grossMargin" 
              stroke="#3B82F6" 
              name="Gross Margin"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="operatingMargin" 
              stroke="#10B981" 
              name="Operating Margin"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="netMargin" 
              stroke="#8B5CF6" 
              name="Net Margin"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProfitabilityChart;

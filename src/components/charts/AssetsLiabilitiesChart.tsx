
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
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetsLiabilitiesChartProps {
  data: Array<{
    year: string;
    totalAssets: number;
    totalLiabilities: number;
  }>;
}

const AssetsLiabilitiesChart: React.FC<AssetsLiabilitiesChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Assets vs Liabilities</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), ""]}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="totalAssets" 
              stroke="#3B82F6" 
              name="Total Assets"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="totalLiabilities" 
              stroke="#EF4444" 
              name="Total Liabilities"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AssetsLiabilitiesChart;

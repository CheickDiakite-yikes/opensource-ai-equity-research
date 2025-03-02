
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GrowthChartProps {
  data: Array<{
    year: string;
    growth: number;
  }>;
  title: string;
  color: string;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data, title, color }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)}%`, "YoY Growth"]}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Bar dataKey="growth" fill={color} name={`${title} YoY`} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GrowthChart;

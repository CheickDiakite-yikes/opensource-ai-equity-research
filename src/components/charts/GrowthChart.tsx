
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2 bg-gradient-to-r from-didi.darkBlue/5 to-didi.lightBlue/5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }}></span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="year" 
                tick={{ fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`} 
                tick={{ fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, "YoY Growth"]}
                labelFormatter={(label) => `Year: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '6px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <ReferenceLine y={0} stroke="#cbd5e1" />
              <Bar 
                dataKey="growth" 
                fill={color} 
                name={`${title} YoY`} 
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GrowthChart;

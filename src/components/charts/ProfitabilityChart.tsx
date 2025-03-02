
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2 bg-gradient-to-r from-didi.darkBlue/5 to-didi.lightBlue/5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-didi.blue"></span>
            Profitability Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
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
                tick={{ fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip 
                formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, ""]}
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
              <Line 
                type="monotone" 
                dataKey="grossMargin" 
                stroke="#1d4ed8" 
                name="Gross Margin"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1800}
              />
              <Line 
                type="monotone" 
                dataKey="operatingMargin" 
                stroke="#3b82f6" 
                name="Operating Margin"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1800}
                animationBegin={300}
              />
              <Line 
                type="monotone" 
                dataKey="netMargin" 
                stroke="#60a5fa" 
                name="Net Margin"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1800}
                animationBegin={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfitabilityChart;

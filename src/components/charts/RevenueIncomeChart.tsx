
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface RevenueIncomeChartProps {
  data: Array<{
    year: string;
    revenue: number;
    netIncome: number;
  }>;
}

const RevenueIncomeChart: React.FC<RevenueIncomeChartProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2 bg-gradient-to-r from-didi.darkBlue/5 to-didi.lightBlue/5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-didi.lightBlue"></span>
            Revenue vs Net Income
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              animationDuration={1000}
              animationEasing="ease-out"
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
                tickFormatter={(value) => `$${(value / 1000000000).toFixed(0)}B`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), ""]}
                labelFormatter={(label) => `Year: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '6px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar 
                dataKey="revenue" 
                name="Revenue" 
                fill="#1d4ed8" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Bar 
                dataKey="netIncome" 
                name="Net Income" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-out"
                animationBegin={300}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RevenueIncomeChart;

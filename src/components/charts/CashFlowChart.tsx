
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { formatFinancialTableValue } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-didi.darkBlue/5 to-didi.lightBlue/5">
          <CardTitle className="font-semibold flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-didi.blue"></span>
            Cash Flow Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="year" 
                tick={{ fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                tick={{ fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(value) => `$${(value / 1000000000).toFixed(1)}B`}
              />
              <Tooltip 
                formatter={(value: number) => [formatFinancialTableValue(value), ""]}
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
                dataKey="Operating Cash Flow" 
                fill="#1d4ed8" 
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Bar 
                dataKey="Free Cash Flow" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
                animationBegin={300}
              />
              <Bar 
                dataKey="Investment Cash Flow" 
                fill="#60a5fa" 
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
                animationBegin={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CashFlowChart;

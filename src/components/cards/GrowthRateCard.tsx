
import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface GrowthRateCardProps {
  title: string;
  value: number;
  industryAvg: number;
  comparison: string;
}

const GrowthRateCard: React.FC<GrowthRateCardProps> = ({ 
  title, 
  value, 
  industryAvg, 
  comparison 
}) => {
  const getComparisonIcon = () => {
    if (value > industryAvg) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (value < industryAvg) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-didi.blue/30"
    >
      <span className="block text-sm text-muted-foreground mb-1">{title}</span>
      <span className="text-xl font-semibold block">
        {value.toFixed(2)}%
      </span>
      <div className="mt-2 flex items-center gap-1">
        <span className="text-xs">Industry: {industryAvg.toFixed(2)}%</span>
        {getComparisonIcon()}
      </div>
      <span className="mt-1 text-xs text-green-600 block">
        {comparison}
      </span>
    </motion.div>
  );
};

export default GrowthRateCard;

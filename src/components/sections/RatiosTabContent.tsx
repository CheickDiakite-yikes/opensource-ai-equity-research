
import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import RatioCard from "@/components/cards/RatioCard";
import TTMCard from "@/components/cards/TTMCard";
import ProfitabilityChart from "@/components/charts/ProfitabilityChart";

interface RatiosTabContentProps {
  ratioData: any[];
  symbol?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const RatiosTabContent: React.FC<RatiosTabContentProps> = ({ ratioData, symbol = "" }) => {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="mt-4 space-y-8"
    >
      <motion.div 
        variants={container} 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {ratioData.slice(0, 3).map((ratio, index) => (
          <motion.div key={index} variants={item}>
            <RatioCard data={ratio} />
          </motion.div>
        ))}
        {symbol && (
          <motion.div variants={item}>
            <TTMCard symbol={symbol} />
          </motion.div>
        )}
      </motion.div>
      
      <motion.div variants={item} transition={{ delay: 0.3 }}>
        <ProfitabilityChart data={ratioData} />
      </motion.div>
    </motion.div>
  );
};

export default RatiosTabContent;

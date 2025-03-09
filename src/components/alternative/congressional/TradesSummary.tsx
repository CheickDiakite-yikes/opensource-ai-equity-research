
import React from 'react';
import { BadgeInfo } from 'lucide-react';
import { motion } from 'framer-motion';
import TradingSummaryCard from './TradingSummaryCard';

interface TradesSummaryProps {
  totalTrades: number;
  purchases: number;
  sales: number;
}

const TradesSummary: React.FC<TradesSummaryProps> = ({
  totalTrades,
  purchases,
  sales
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
    >
      <TradingSummaryCard
        title="Total Transactions"
        value={totalTrades.toString()}
        icon={<BadgeInfo className="h-5 w-5" />}
      />
      <TradingSummaryCard
        title="Purchases"
        value={purchases.toString()}
        icon={<BadgeInfo className="h-5 w-5 text-green-500" />}
      />
      <TradingSummaryCard
        title="Sales"
        value={sales.toString()}
        icon={<BadgeInfo className="h-5 w-5 text-red-500" />}
      />
    </motion.div>
  );
};

export default TradesSummary;

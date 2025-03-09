
import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface TradingSummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass?: string;
}

const TradingSummaryCard: React.FC<TradingSummaryCardProps> = ({ 
  title, 
  value, 
  icon,
  colorClass = 'text-primary'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${colorClass} bg-opacity-10`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TradingSummaryCard;

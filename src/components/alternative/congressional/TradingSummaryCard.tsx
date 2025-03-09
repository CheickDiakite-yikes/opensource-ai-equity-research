
import React from 'react';
import { Card } from '@/components/ui/card';

interface TradingSummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const TradingSummaryCard: React.FC<TradingSummaryCardProps> = ({ 
  title, 
  value, 
  icon 
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
};

export default TradingSummaryCard;

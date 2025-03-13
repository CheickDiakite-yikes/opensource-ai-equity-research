
import React from "react";
import { Building } from "lucide-react";

interface CompanyCardHeaderProps {
  symbol: string;
  name: string;
  compact?: boolean;
}

const CompanyCardHeader: React.FC<CompanyCardHeaderProps> = ({ 
  symbol, 
  name,
  compact = false
}) => {
  // Truncate the company name if it's too long
  const displayName = compact && name.length > 18 
    ? `${name.substring(0, 16)}...` 
    : name;

  return (
    <div className="flex items-start justify-between mb-1">
      <div className="flex items-center">
        <div className={`flex items-center justify-center rounded-lg ${compact ? 'w-7 h-7' : 'w-8 h-8'} bg-blue-100 dark:bg-blue-900/30 mr-2`}>
          <Building className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-blue-600 dark:text-blue-400`} />
        </div>
        <div>
          <h3 className={`font-medium ${compact ? 'text-sm' : 'text-base'} line-clamp-1 mb-0.5`}>
            {symbol}
          </h3>
          <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'} line-clamp-1`}>
            {displayName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyCardHeader;

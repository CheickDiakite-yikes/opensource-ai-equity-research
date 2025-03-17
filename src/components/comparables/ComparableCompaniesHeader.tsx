
import React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ComparableCompaniesHeaderProps {
  symbol: string;
}

const ComparableCompaniesHeader: React.FC<ComparableCompaniesHeaderProps> = ({ symbol }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold">Comparable Companies Analysis</h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-5 w-5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <p>This analysis compares {symbol} to similar companies in its industry based on key financial metrics and valuation multiples.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-muted-foreground">
        Compare {symbol} with its industry peers based on key financial metrics and valuation multiples.
      </p>
    </div>
  );
};

export default ComparableCompaniesHeader;

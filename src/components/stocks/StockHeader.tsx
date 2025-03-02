
import React from "react";
import { Briefcase, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StockHeaderProps {
  symbol: string;
  onClear: () => void;
}

const StockHeader: React.FC<StockHeaderProps> = ({ symbol, onClear }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          {symbol}
        </h2>
        <p className="text-muted-foreground">Equity Research & Analysis</p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => window.open(`https://finance.yahoo.com/quote/${symbol}`, '_blank')}
        >
          <Globe className="h-4 w-4" />
          <span>External Data</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => window.open(`https://finance.yahoo.com/quote/${symbol}/history`, '_blank')}
        >
          <Calendar className="h-4 w-4" />
          <span>Historical Data</span>
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-muted-foreground hover:text-foreground"
          onClick={onClear}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default StockHeader;

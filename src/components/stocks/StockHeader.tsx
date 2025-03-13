
import React from "react";
import { Briefcase, Globe, Calendar, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StockHeaderProps {
  symbol: string;
  onClear: () => void;
}

const StockHeader: React.FC<StockHeaderProps> = ({ symbol, onClear }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
      <div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          {symbol}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">Equity Research & Analysis</p>
      </div>
      
      {isMobile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              <Menu className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => window.open(`https://finance.yahoo.com/quote/${symbol}`, '_blank')}>
              <Globe className="h-4 w-4 mr-2" />
              External Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`https://finance.yahoo.com/quote/${symbol}/history`, '_blank')}>
              <Calendar className="h-4 w-4 mr-2" />
              Historical Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onClear}>
              Clear
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
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
      )}
    </div>
  );
};

export default StockHeader;

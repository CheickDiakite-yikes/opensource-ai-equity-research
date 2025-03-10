
import React from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

interface StockHeaderProps {
  symbol: string;
  onClear: () => void;
}

const StockHeader: React.FC<StockHeaderProps> = ({ symbol, onClear }) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <Button 
          onClick={onClear} 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {!isMobile && <span>Back</span>}
        </Button>
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {symbol}
          </h1>
          <p className="text-sm text-muted-foreground">
            Stock analysis and research
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          className="flex items-center gap-1"
          asChild
        >
          <a 
            href={`https://finance.yahoo.com/quote/${symbol}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <span>Yahoo Finance</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default StockHeader;

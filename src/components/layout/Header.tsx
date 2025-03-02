
import React from "react";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  symbol: string;
  setSymbol: (symbol: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

const Header: React.FC<HeaderProps> = ({
  symbol,
  setSymbol,
  handleSearch,
  isLoading,
  handleKeyDown
}) => {
  return (
    <header className="border-b border-border p-4 bg-gradient-to-r from-background to-secondary/30">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <img 
            src="/lovable-uploads/253c2c77-f09d-4088-83eb-0299dfaf98f2.png" 
            alt="DiDi Equity Research" 
            className="h-10"
          />
          <span>Equity Research</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search ticker symbol..."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-background/80 backdrop-blur-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !symbol.trim()} 
            size="sm"
            className="gap-1"
          >
            {isLoading ? (
              "Searching..."
            ) : (
              <>
                Search
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;


import React from "react";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
    <header className="border-b border-border py-4 px-6 backdrop-blur-md sticky top-0 z-10 shadow-md bg-background/95">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <img 
              src="/lovable-uploads/1e3c657c-1d0d-47f6-8182-ffd8ac803802.png" 
              alt="DiDi Equity Research" 
              className="h-10"
            />
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Equity Research
            </span>
          </h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <div className="relative flex-1 sm:w-64">
            <Input
              type="text"
              placeholder="Search ticker symbol..."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-background pr-4 h-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !symbol.trim()} 
            className="gap-1 px-4 h-10"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Searching...
              </span>
            ) : (
              <>
                Search
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;

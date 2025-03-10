
import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import UserMenu from "./UserMenu";

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
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
    // Navigate to home and ensure landing view is shown
    navigate('/', { replace: true });
    // Clear any search parameters that might show a stock
    window.history.replaceState({}, '', '/');
    // Clear the input field 
    setSymbol('');
    // Force clear the searchedSymbol in parent component (Index.tsx)
    window.dispatchEvent(new CustomEvent('clearSearchedSymbol'));
  };
  
  return (
    <header className="border-b border-border/40 py-4 px-6 bg-gradient-to-r from-background to-secondary/10 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <div 
            onClick={handleLogoClick} 
            className="flex items-center gap-2 cursor-pointer"
          >
            <img 
              src="/lovable-uploads/288626b2-84b1-4aca-9399-864c39d76976.png" 
              alt="DiDi Equity Research" 
              className="h-10"
            />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 text-2xl font-bold">
              Equity Research
            </span>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-4">
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
                className="pl-10 bg-background/80 backdrop-blur-sm pr-4 border-border/50 focus:border-primary/50 transition-colors h-10"
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
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;

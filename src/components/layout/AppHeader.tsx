
import React from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/search/SearchBar";
import UserMenu from "./UserMenu";
import { motion } from "framer-motion";

// Define props interface
interface AppHeaderProps {
  // Make featuredSymbols optional since SearchBar has a default value
  featuredSymbols?: { symbol: string; name: string }[];
}

const AppHeader: React.FC<AppHeaderProps> = ({ featuredSymbols }) => {
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
    navigate('/');
  };
  
  return (
    <header className="border-b border-border/40 py-4 px-6 bg-gradient-to-r from-background to-secondary/10 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
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
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 max-w-md"
          >
            <SearchBar 
              placeholder="Search ticker symbol..."
              className="w-full"
              featuredSymbols={featuredSymbols}
            />
          </motion.div>
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

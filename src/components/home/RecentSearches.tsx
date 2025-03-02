
import React from "react";
import { CheckCircle2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface RecentSearchesProps {
  recentSearches: string[];
  onSelectSymbol: (symbol: string) => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ 
  recentSearches, 
  onSelectSymbol 
}) => {
  if (recentSearches.length === 0) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        Recent Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {recentSearches.map((sym) => (
          <Button
            key={sym}
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => onSelectSymbol(sym)}
          >
            <Briefcase className="h-4 w-4 text-primary" />
            {sym}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentSearches;

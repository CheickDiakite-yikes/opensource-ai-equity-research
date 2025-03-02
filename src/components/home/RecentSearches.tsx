
import React from "react";
import { CheckCircle2, Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface RecentSearchesProps {
  recentSearches: string[];
  onSelectSymbol: (symbol: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
};

const RecentSearches: React.FC<RecentSearchesProps> = ({ 
  recentSearches, 
  onSelectSymbol 
}) => {
  if (recentSearches.length === 0) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Recent Searches</h3>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-3"
      >
        {recentSearches.map((sym) => (
          <motion.div key={sym} variants={item}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 bg-background/80 hover:bg-background"
              onClick={() => onSelectSymbol(sym)}
            >
              <Briefcase className="h-4 w-4 text-primary" />
              {sym}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default RecentSearches;

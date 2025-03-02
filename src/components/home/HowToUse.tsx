
import React from "react";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

const HowToUse: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="max-w-3xl mx-auto mt-12 p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5"
    >
      <div className="flex gap-3 items-start">
        <div className="p-2 bg-primary/10 rounded-full">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-medium mb-1">How to use</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
            <li>Enter a stock ticker symbol in the search box (e.g., AAPL, MSFT, GOOG)</li>
            <li>Explore company overview including key financials and recent performance</li>
            <li>Analyze financial data with interactive charts and detailed metrics</li>
            <li>Generate AI research reports to get comprehensive analysis and price targets</li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
};

export default HowToUse;

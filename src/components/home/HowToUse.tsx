
import React from "react";
import { Info, Shield, Check } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  "Enter a stock ticker symbol in the search box (e.g., AAPL, MSFT, GOOG)",
  "Explore company overview including key financials and recent performance",
  "Analyze financial data with interactive charts and detailed metrics",
  "Generate AI research reports to get comprehensive analysis and price targets"
];

const HowToUse: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="max-w-3xl mx-auto mt-12 rounded-lg"
    >
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-8 -mb-8" />
        
        <div className="relative flex gap-4 items-start">
          <div className="p-2 bg-primary/10 rounded-full">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">How to use DiDi Equity Research</h3>
            <ul className="space-y-3">
              {steps.map((step, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  className="flex items-start gap-2"
                >
                  <div className="mt-0.5 min-w-6 min-h-6 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-sm font-medium">{index + 1}</span>
                  </div>
                  <span className="text-muted-foreground">{step}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HowToUse;

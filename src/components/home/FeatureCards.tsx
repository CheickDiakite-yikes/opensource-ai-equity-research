
import React from "react";
import { BarChart4, FileText, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const FeatureCards: React.FC = () => {
  return (
    <div className="py-12 px-4">
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-10 text-center"
      >
        Powerful Features for Investors
      </motion.h2>
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2
            }
          }
        }}
        className="grid gap-8 md:grid-cols-3"
      >
        <motion.div variants={cardVariants} transition={{ duration: 0.5 }}>
          <Card className="h-full overflow-hidden border border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] bg-card/60 backdrop-blur-sm">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <div className="p-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 flex items-center justify-center rounded-full mb-6 text-blue-600 dark:text-blue-400">
                <BarChart4 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Comprehensive Analysis</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Access detailed financial data including income statements, balance sheets, cash flows, and key ratios
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Financial Ratios</span>
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Growth Analysis</span>
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">DCF Valuation</span>
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div variants={cardVariants} transition={{ duration: 0.5 }}>
          <Card className="h-full overflow-hidden border border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] bg-card/60 backdrop-blur-sm">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-violet-400" />
            <div className="p-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-14 h-14 flex items-center justify-center rounded-full mb-6 text-purple-600 dark:text-purple-400">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Research Reports</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Generate detailed research reports with investment theses, valuation models, and recommendations
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">Investment Analysis</span>
                <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">Risk Assessment</span>
                <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">Recommendations</span>
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div variants={cardVariants} transition={{ duration: 0.5 }}>
          <Card className="h-full overflow-hidden border border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] bg-card/60 backdrop-blur-sm">
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-400" />
            <div className="p-6">
              <div className="bg-green-100 dark:bg-green-900/30 w-14 h-14 flex items-center justify-center rounded-full mb-6 text-green-600 dark:text-green-400">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Price Predictions</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Get AI-powered stock price forecasts with potential upside/downside and confidence levels
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Short-Term</span>
                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Mid-Term</span>
                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Long-Term</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FeatureCards;

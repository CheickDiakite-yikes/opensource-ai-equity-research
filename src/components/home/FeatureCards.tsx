
import React from "react";
import { BarChart4, FileText, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const FeatureCards: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">
            <span className="text-foreground">Powerful </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Features
            </span>
            <span className="text-foreground"> for Investors</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Our platform offers comprehensive tools to help you make informed investment decisions
          </p>
        </motion.div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-8 md:grid-cols-3"
        >
          <motion.div variants={item}>
            <Card className="border p-6 h-full hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
              <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <BarChart4 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Comprehensive Analysis</h3>
              <p className="text-muted-foreground mb-4">
                Access detailed financial data including income statements, balance sheets, cash flows, and key ratios.
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                <span className="text-xs px-2.5 py-1 bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Financial Ratios</span>
                <span className="text-xs px-2.5 py-1 bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Growth Analysis</span>
                <span className="text-xs px-2.5 py-1 bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">DCF Valuation</span>
              </div>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="border p-6 h-full hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
              <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl mb-3">AI Research Reports</h3>
              <p className="text-muted-foreground mb-4">
                Generate detailed research reports with investment theses, valuation models, and recommendations.
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                <span className="text-xs px-2.5 py-1 bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Investment Analysis</span>
                <span className="text-xs px-2.5 py-1 bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Risk Assessment</span>
                <span className="text-xs px-2.5 py-1 bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Recommendations</span>
              </div>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="border p-6 h-full hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
              <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Price Predictions</h3>
              <p className="text-muted-foreground mb-4">
                Get AI-powered stock price forecasts with potential upside/downside and confidence levels.
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                <span className="text-xs px-2.5 py-1 bg-green-100/60 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Short-Term</span>
                <span className="text-xs px-2.5 py-1 bg-green-100/60 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Mid-Term</span>
                <span className="text-xs px-2.5 py-1 bg-green-100/60 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Long-Term</span>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureCards;

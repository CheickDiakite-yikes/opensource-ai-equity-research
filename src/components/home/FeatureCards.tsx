
import React from "react";
import { BarChart4, FileText, TrendingUp, ChartBar, PieChart, BarChart, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const FeatureCards: React.FC = () => {
  return (
    <div className="py-16">
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-12 text-center"
      >
        <span className="inline-block">Powerful </span>
        <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Features
        </span>
        <span className="inline-block"> for Investors</span>
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
        {/* Comprehensive Analysis */}
        <motion.div variants={cardVariants} transition={{ duration: 0.5 }}>
          <Card className="relative h-full overflow-hidden border-0 bg-gradient-to-b from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
            <div className="absolute top-0 left-0 w-24 h-24 bg-blue-400/10 rounded-br-full" />
            <div className="px-6 pt-8 pb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 flex items-center justify-center rounded-xl mb-6 text-blue-600 dark:text-blue-400 shadow-sm group-hover:shadow-blue-200/50 dark:group-hover:shadow-blue-800/30 transition-all">
                <BarChart4 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Comprehensive Analysis</h3>
              <p className="text-muted-foreground mb-4">
                Access detailed financial data including income statements, balance sheets, cash flows, and key ratios
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Financial Ratios</span>
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Growth Analysis</span>
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">DCF Valuation</span>
              </div>
              
              <div className="mt-6">
                <Button variant="ghost" className="text-blue-600 dark:text-blue-400 p-0 hover:bg-transparent group">
                  <span className="mr-1">Learn more</span> 
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* AI Research Reports */}
        <motion.div variants={cardVariants} transition={{ duration: 0.5 }}>
          <Card className="relative h-full overflow-hidden border-0 bg-gradient-to-b from-white to-purple-50/50 dark:from-slate-900 dark:to-purple-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
            <div className="absolute top-0 left-0 w-24 h-24 bg-purple-400/10 rounded-br-full" />
            <div className="px-6 pt-8 pb-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-14 h-14 flex items-center justify-center rounded-xl mb-6 text-purple-600 dark:text-purple-400 shadow-sm group-hover:shadow-purple-200/50 dark:group-hover:shadow-purple-800/30 transition-all">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Research Reports</h3>
              <p className="text-muted-foreground mb-4">
                Generate detailed research reports with investment theses, valuation models, and recommendations
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">Investment Analysis</span>
                <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">Risk Assessment</span>
                <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">Recommendations</span>
              </div>
              
              <div className="mt-6">
                <Button variant="ghost" className="text-purple-600 dark:text-purple-400 p-0 hover:bg-transparent group">
                  <span className="mr-1">Learn more</span> 
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Price Predictions */}
        <motion.div variants={cardVariants} transition={{ duration: 0.5 }}>
          <Card className="relative h-full overflow-hidden border-0 bg-gradient-to-b from-white to-green-50/50 dark:from-slate-900 dark:to-green-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600" />
            <div className="absolute top-0 left-0 w-24 h-24 bg-green-400/10 rounded-br-full" />
            <div className="px-6 pt-8 pb-6">
              <div className="bg-green-100 dark:bg-green-900/30 w-14 h-14 flex items-center justify-center rounded-xl mb-6 text-green-600 dark:text-green-400 shadow-sm group-hover:shadow-green-200/50 dark:group-hover:shadow-green-800/30 transition-all">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Price Predictions</h3>
              <p className="text-muted-foreground mb-4">
                Get AI-powered stock price forecasts with potential upside/downside and confidence levels
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Short-Term</span>
                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Mid-Term</span>
                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Long-Term</span>
              </div>
              
              <div className="mt-6">
                <Button variant="ghost" className="text-green-600 dark:text-green-400 p-0 hover:bg-transparent group">
                  <span className="mr-1">Learn more</span> 
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Additional features row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-16 flex justify-center"
      >
        <div className="inline-flex flex-wrap justify-center gap-4 md:gap-8 px-4 py-3 rounded-full bg-slate-100/60 dark:bg-slate-800/40 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <ChartBar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-muted-foreground">Sentiment Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-muted-foreground">Portfolio Optimization</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-muted-foreground">Risk Management</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeatureCards;

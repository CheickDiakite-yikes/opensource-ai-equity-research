
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
    <div className="py-10 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-screen-xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <h2 className="text-3xl font-bold mb-3 md:mb-0">
            <span className="inline-block">Powerful </span>
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Features
            </span>
          </h2>
          
          <p className="text-muted-foreground max-w-lg md:text-right">
            Our platform offers comprehensive tools to help you make informed investment decisions
          </p>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
          className="grid gap-6 md:grid-cols-3"
        >
          {/* Comprehensive Analysis */}
          <motion.div variants={cardVariants} transition={{ duration: 0.5 }}>
            <Card className="relative h-full overflow-hidden border-0 bg-gradient-to-b from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
              <div className="px-5 pt-6 pb-5">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 flex items-center justify-center rounded-xl mb-4 text-blue-600 dark:text-blue-400 shadow-sm group-hover:shadow-blue-200/50 dark:group-hover:shadow-blue-800/30 transition-all">
                  <BarChart4 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Comprehensive Analysis</h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  Access detailed financial data including income statements, balance sheets, cash flows, and key ratios
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Financial Ratios</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Growth Analysis</span>
                </div>
                
                <div className="mt-4">
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
              <div className="px-5 pt-6 pb-5">
                <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 flex items-center justify-center rounded-xl mb-4 text-purple-600 dark:text-purple-400 shadow-sm group-hover:shadow-purple-200/50 dark:group-hover:shadow-purple-800/30 transition-all">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Research Reports</h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  Generate detailed research reports with investment theses, valuation models, and recommendations
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">Investment Analysis</span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">Risk Assessment</span>
                </div>
                
                <div className="mt-4">
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
              <div className="px-5 pt-6 pb-5">
                <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 flex items-center justify-center rounded-xl mb-4 text-green-600 dark:text-green-400 shadow-sm group-hover:shadow-green-200/50 dark:group-hover:shadow-green-800/30 transition-all">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Price Predictions</h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  Get AI-powered stock price forecasts with potential upside/downside and confidence levels
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Short-Term</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Long-Term</span>
                </div>
                
                <div className="mt-4">
                  <Button variant="ghost" className="text-green-600 dark:text-green-400 p-0 hover:bg-transparent group">
                    <span className="mr-1">Learn more</span> 
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeatureCards;

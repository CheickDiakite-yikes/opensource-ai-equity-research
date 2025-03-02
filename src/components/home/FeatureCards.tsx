
import React from "react";
import { BarChart4, FileText, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const FeatureCards: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="grid gap-6 md:grid-cols-3"
    >
      <Card className="p-6 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border-border/50 bg-card/40 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <BarChart4 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Comprehensive Analysis</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Access detailed financial data including income statements, balance sheets, cash flows, and key ratios
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Financial Ratios</span>
              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Growth Analysis</span>
              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">DCF Valuation</span>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border-border/50 bg-card/40 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium">AI Research Reports</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Generate detailed research reports with investment theses, valuation models, and recommendations
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Investment Analysis</span>
              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Risk Assessment</span>
              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Recommendations</span>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border-border/50 bg-card/40 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Price Predictions</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Get AI-powered stock price forecasts with potential upside/downside and confidence levels
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Short-Term</span>
              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Mid-Term</span>
              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Long-Term</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FeatureCards;

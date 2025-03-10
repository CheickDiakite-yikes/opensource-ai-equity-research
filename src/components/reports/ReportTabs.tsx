
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp, Info, Download, ArrowUp, ArrowDown } from "lucide-react";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import ResearchReportDisplay from "./ResearchReportDisplay";
import PricePredictionDisplay from "./PricePredictionDisplay";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ReportTabsProps {
  report: ResearchReport | null;
  prediction: StockPrediction | null;
}

const ReportTabs: React.FC<ReportTabsProps> = ({ report, prediction }) => {
  if (!report && !prediction) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 h-80">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Info className="h-14 w-14 text-muted-foreground mb-5" />
          <h3 className="text-xl font-medium mb-3">No Reports Generated</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Generate a research report or price prediction to see detailed analysis here.
            These AI-powered reports provide comprehensive insights into the stock's fundamentals and future prospects.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span>Research Reports</span>
              <ArrowUp className="h-3 w-3 text-primary" />
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Price Predictions</span>
              <ArrowUp className="h-3 w-3 text-primary" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue={report ? "report" : "prediction"} className="w-full">
      <TabsList className="grid w-full grid-cols-2 p-1 mb-4">
        <TabsTrigger 
          value="report" 
          disabled={!report}
          className={cn(
            "flex items-center gap-2 py-3",
            !report && "opacity-50 cursor-not-allowed"
          )}
        >
          <FileText className="h-4 w-4" />
          <span>Research Report</span>
          {report && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium h-5 w-5">
              1
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="prediction" 
          disabled={!prediction}
          className={cn(
            "flex items-center gap-2 py-3",
            !prediction && "opacity-50 cursor-not-allowed"
          )}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Price Prediction</span>
          {prediction && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium h-5 w-5">
              1
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="report" className="mt-6 animate-fade-in">
        {report && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ResearchReportDisplay report={report} />
          </motion.div>
        )}
      </TabsContent>
      
      <TabsContent value="prediction" className="mt-6 animate-fade-in">
        {prediction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PricePredictionDisplay prediction={prediction} />
          </motion.div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ReportTabs;

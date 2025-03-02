
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp, Info } from "lucide-react";
import { ResearchReport, StockPrediction } from "@/types";
import ResearchReportDisplay from "./ResearchReportDisplay";
import PricePredictionDisplay from "./PricePredictionDisplay";
import { cn } from "@/lib/utils";

interface ReportTabsProps {
  report: ResearchReport | null;
  prediction: StockPrediction | null;
}

const ReportTabs: React.FC<ReportTabsProps> = ({ report, prediction }) => {
  if (!report && !prediction) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Reports Generated</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Generate a research report or price prediction to see detailed analysis here.
        </p>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue={report ? "report" : "prediction"} className="w-full">
      <TabsList className="grid w-full grid-cols-2 p-1 mb-2">
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
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="report" className="mt-6 animate-fade-in">
        {report && <ResearchReportDisplay report={report} />}
      </TabsContent>
      
      <TabsContent value="prediction" className="mt-6 animate-fade-in">
        {prediction && <PricePredictionDisplay prediction={prediction} />}
      </TabsContent>
    </Tabs>
  );
};

export default ReportTabs;

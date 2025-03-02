
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResearchReport, StockPrediction } from "@/types";
import ResearchReportDisplay from "./ResearchReportDisplay";
import PricePredictionDisplay from "./PricePredictionDisplay";

interface ReportTabsProps {
  report: ResearchReport | null;
  prediction: StockPrediction | null;
}

const ReportTabs: React.FC<ReportTabsProps> = ({ report, prediction }) => {
  if (!report && !prediction) return null;
  
  return (
    <Tabs defaultValue={report ? "report" : "prediction"} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="report" disabled={!report}>Research Report</TabsTrigger>
        <TabsTrigger value="prediction" disabled={!prediction}>Price Prediction</TabsTrigger>
      </TabsList>
      
      <TabsContent value="report" className="mt-4">
        {report && <ResearchReportDisplay report={report} />}
      </TabsContent>
      
      <TabsContent value="prediction" className="mt-4">
        {prediction && <PricePredictionDisplay prediction={prediction} />}
      </TabsContent>
    </Tabs>
  );
};

export default ReportTabs;

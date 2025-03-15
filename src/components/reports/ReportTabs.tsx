
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import ResearchReportDisplay from "./ResearchReportDisplay";
import PricePredictionDisplay from "./PricePredictionDisplay";
import InfoIcon from "@/components/home/card-components/InfoIcon";

interface ReportTabsProps {
  report: ResearchReport | null;
  prediction: StockPrediction | null;
}

const ReportTabs = ({ report, prediction }: ReportTabsProps) => {
  if (!report && !prediction) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed rounded-lg border-gray-700/50 bg-gray-900/30">
        <div className="mb-4">
          <InfoIcon size={20} />
        </div>
        <h3 className="text-xl font-medium mb-2">No Reports Generated</h3>
        <p className="text-muted-foreground max-w-md">
          Generate a research report or price prediction 
          to see detailed analysis here. These AI-powered reports provide comprehensive 
          insights into the stock's fundamentals and future prospects.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md">
            <span className="text-sm font-medium">Research Reports</span>
            <span className="text-xs bg-primary/20 p-1 rounded">+</span>
          </button>
          <button className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-4 py-2 rounded-md">
            <span className="text-sm font-medium">Price Predictions</span>
            <span className="text-xs bg-indigo-500/20 p-1 rounded">+</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue={report ? "report" : "prediction"} className="w-full">
      <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
        <TabsTrigger
          value="report"
          disabled={!report}
          className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
        >
          Research Report
        </TabsTrigger>
        <TabsTrigger
          value="prediction"
          disabled={!prediction}
          className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400"
        >
          Price Prediction
        </TabsTrigger>
      </TabsList>
      <TabsContent value="report">
        {report ? <ResearchReportDisplay report={report} /> : null}
      </TabsContent>
      <TabsContent value="prediction">
        {prediction ? <PricePredictionDisplay prediction={prediction} /> : null}
      </TabsContent>
    </Tabs>
  );
};

export default ReportTabs;


import { useState } from "react";
import { 
  generateResearchReport, 
  generateStockPrediction,
  saveResearchReport,
  savePricePrediction
} from "@/services/api/analysis/researchService";
import { useToast } from "@/hooks/use-toast";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";

export type ReportType = "standard" | "comprehensive" | "valuation" | "growth";

export const useReportGeneration = (symbol: string, stockData: any) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [reportType, setReportType] = useState<ReportType>("comprehensive");
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!stockData) return;

    setIsGenerating(true);
    try {
      const {
        profile,
        financials,
        news = [],
        peers = []
      } = stockData;

      const reportRequest = {
        symbol,
        companyName: profile?.companyName || symbol,
        sector: profile?.sector || "Unknown",
        industry: profile?.industry || "Unknown",
        description: profile?.description || "",
        stockData: profile,
        financials,
        news,
        peers,
        reportType
      };

      const generatedReport = await generateResearchReport(reportRequest);
      setReport(generatedReport);
      
      // Save the generated report to the database
      if (generatedReport) {
        await saveResearchReport(
          symbol, 
          profile?.companyName || symbol, 
          generatedReport
        );
        toast({
          title: "Report saved",
          description: "Your report has been saved and can be accessed later.",
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate the research report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePredictPrice = async () => {
    if (!stockData) return;

    setIsPredicting(true);
    try {
      const {
        profile,
        financials,
        news = []
      } = stockData;

      const generatedPrediction = await generateStockPrediction(
        symbol,
        profile,
        financials,
        news
      );
      setPrediction(generatedPrediction);
      
      // Save the generated prediction to the database
      if (generatedPrediction) {
        await savePricePrediction(
          symbol, 
          profile?.companyName || symbol, 
          generatedPrediction
        );
        toast({
          title: "Prediction saved",
          description: "Your price prediction has been saved and can be accessed later.",
        });
      }
    } catch (error) {
      console.error("Error generating prediction:", error);
      toast({
        title: "Error",
        description: "Failed to generate the price prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  return {
    isGenerating,
    isPredicting,
    report,
    prediction,
    reportType,
    setReportType,
    handleGenerateReport,
    handlePredictPrice
  };
};

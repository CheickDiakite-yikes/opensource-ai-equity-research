
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { 
  generateResearchReport,
  generateStockPrediction
} from "@/services/api";

import type { 
  ReportRequest,
  ResearchReport,
  StockQuote,
  StockPrediction,
  NewsArticle,
} from "@/types";

import type { ReportData } from "./useResearchReportData";

export const useReportGeneration = (symbol: string, data: ReportData) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [reportType, setReportType] = useState<string>("comprehensive");

  const handleGenerateReport = async () => {
    try {
      if (!data.profile || !data.quote) {
        toast({
          title: "Error",
          description: "Cannot generate report: missing stock data",
          variant: "destructive",
        });
        return;
      }
      
      setIsGenerating(true);
      
      const reportRequest: ReportRequest = {
        symbol,
        companyName: data.profile.companyName,
        sector: data.profile.sector,
        industry: data.profile.industry,
        description: data.profile.description,
        stockData: data.quote,
        financials: {
          income: data.income,
          balance: data.balance,
          cashflow: data.cashflow,
          ratios: data.ratios
        },
        news: data.news,
        peers: data.peers,
        reportType: reportType // Pass the report type to guide AI generation
      };
      
      toast({
        title: "Generating Report",
        description: "Creating a detailed AI-powered research report based on real financial data...",
      });
      
      const generatedReport = await generateResearchReport(reportRequest);
      
      if (!generatedReport) {
        throw new Error("Failed to generate report");
      }
      
      // Log the sections we received to help with debugging
      console.log("Report sections received:", generatedReport.sections.map(s => s.title));
      
      setReport(generatedReport);
      
      toast({
        title: "Report Generated",
        description: `Research report for ${data.profile.companyName} successfully generated with AI analysis of financial data.`,
      });
    } catch (err) {
      console.error("Error generating report:", err);
      toast({
        title: "Error",
        description: `Failed to generate report: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePredictPrice = async () => {
    try {
      if (!data.profile || !data.quote) {
        toast({
          title: "Error",
          description: "Cannot generate prediction: missing stock data",
          variant: "destructive",
        });
        return;
      }
      
      setIsPredicting(true);
      
      const financials = {
        income: data.income,
        balance: data.balance,
        cashflow: data.cashflow,
        ratios: data.ratios,
        transcripts: data.transcripts?.slice(0, 2) || [],
        filings: data.filings?.slice(0, 5) || []
      };
      
      toast({
        title: "Generating Prediction",
        description: "Analyzing financial data and market trends to predict future prices...",
      });
      
      const prediction = await generateStockPrediction(
        symbol,
        data.quote,
        financials,
        data.news
      );
      
      if (!prediction) {
        throw new Error("Failed to generate price prediction");
      }
      
      setPrediction(prediction);
      
      toast({
        title: "Prediction Generated",
        description: "Price prediction has been successfully generated based on AI analysis.",
      });
    } catch (err) {
      console.error("Error generating prediction:", err);
      toast({
        title: "Error",
        description: `Failed to generate prediction: ${err.message}`,
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


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
      
      // Add explicit instructions for including the new sections in the toast
      toast({
        title: "Generating Report",
        description: "Creating a detailed report with rating, scenarios, and catalysts...",
      });
      
      const generatedReport = await generateResearchReport(reportRequest);
      
      if (!generatedReport) {
        throw new Error("Failed to generate report");
      }
      
      // Ensure required sections are present with defaults if needed
      const enhancedReport: ResearchReport = {
        ...generatedReport,
        summary: generatedReport.summary || "Summary not available", // Ensure summary exists
        ratingDetails: generatedReport.ratingDetails || {
          ratingScale: "Buy / Hold / Sell",
          ratingJustification: "Based on fundamental and technical analysis."
        },
        scenarioAnalysis: generatedReport.scenarioAnalysis || {
          bullCase: {
            price: "N/A",
            probability: "25",
            drivers: ["Positive market conditions"]
          },
          baseCase: {
            price: generatedReport.targetPrice,
            probability: "50",
            drivers: ["Expected market conditions"]
          },
          bearCase: {
            price: "N/A",
            probability: "25",
            drivers: ["Negative market conditions"]
          }
        },
        catalysts: generatedReport.catalysts || {
          positive: ["Company growth potential"],
          negative: ["Market risks"]
        }
      };
      
      setReport(enhancedReport);
      
      toast({
        title: "Report Generated",
        description: "Research report has been successfully generated with all sections.",
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
        description: "Price prediction has been successfully generated.",
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

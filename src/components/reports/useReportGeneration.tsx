import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { 
  generateResearchReport,
  generateStockPrediction
} from "@/services/api";

import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import type { StockPrediction } from "@/types/ai-analysis/predictionTypes";

import type { ReportData } from "./useResearchReportData";

export const useReportGeneration = (symbol: string, data: ReportData) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [reportType, setReportType] = useState<string>("comprehensive");
  const [generationError, setGenerationError] = useState<string | null>(null);

  const validateReport = (generatedReport: ResearchReport): boolean => {
    const expectedSections = ["investment thesis", "business overview", "financial analysis", "valuation", "risk factors"];
    const missingSections = expectedSections.filter(expected => 
      !generatedReport.sections.some(section => 
        section.title.toLowerCase().includes(expected)
      )
    );
    
    if (missingSections.length > 0) {
      console.warn(`Report missing key sections: ${missingSections.join(', ')}`);
      return false;
    }
    
    const shortSections = generatedReport.sections.filter(s => s.content.length < 200);
    if (shortSections.length > 0) {
      console.warn(`Report has ${shortSections.length} sections with less than 200 characters:`, 
        shortSections.map(s => s.title).join(', '));
      return false;
    }
    
    return true;
  };

  const handleGenerateReport = async (forceRegenerate = false) => {
    try {
      if (!data.profile || !data.quote) {
        toast({
          title: "Error",
          description: "Cannot generate report: missing stock data",
          variant: "destructive",
        });
        return;
      }
      
      if (report && !forceRegenerate) {
        toast({
          title: "Report Already Generated",
          description: "A report has already been generated. Click 'Regenerate' if you want a new one.",
        });
        return;
      }
      
      setIsGenerating(true);
      setGenerationError(null);
      
      const reportRequest = {
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
        reportType: reportType
      };
      
      toast({
        title: "Generating AI Report",
        description: `Creating a detailed ${reportType} research report based on financial data...`,
      });
      
      console.log("Sending report request:", {
        symbol,
        companyName: data.profile.companyName,
        reportType,
        hasFinancials: !!data.income?.length,
        newsCount: data.news?.length,
        peersCount: data.peers?.length
      });
      
      const generatedReport = await generateResearchReport(reportRequest);
      
      if (!generatedReport) {
        throw new Error("Failed to generate report - no data returned");
      }
      
      console.log("Report received from API:", {
        symbol: generatedReport.symbol,
        recommendation: generatedReport.recommendation,
        sectionsReceived: generatedReport.sections?.length || 0, 
        sectionsData: generatedReport.sections?.map(s => s.title) || [],
        hasRatingDetails: !!generatedReport.ratingDetails,
        hasScenarioAnalysis: !!generatedReport.scenarioAnalysis,
        hasCatalysts: !!generatedReport.catalysts,
        summaryLength: generatedReport.summary?.length || 0
      });
      
      const isHighQuality = validateReport(generatedReport);
      
      setReport(generatedReport);
      
      toast({
        title: "AI Report Generated",
        description: `Research report for ${data.profile.companyName} successfully generated with ${generatedReport.sections.length} sections.${!isHighQuality ? ' Some sections may need enhancement.' : ''}`,
        variant: "default"
      });
    } catch (err: any) {
      console.error("Error generating report:", err);
      setGenerationError(err.message);
      toast({
        title: "Error",
        description: `Failed to generate report: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateReport = async () => {
    await handleGenerateReport(true);
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
        title: "Generating AI Prediction",
        description: "Analyzing real financial data and market trends using AI to predict future prices...",
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
        title: "AI Prediction Generated",
        description: "Price prediction has been successfully generated based on AI analysis of real market data.",
      });
    } catch (err: any) {
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
    generationError,
    setReportType,
    handleGenerateReport,
    handleRegenerateReport,
    handlePredictPrice
  };
};

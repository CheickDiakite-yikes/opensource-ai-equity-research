
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
  ChartSection
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
      
      // Determine chart sections based on report type
      const chartSections: ChartSection[] = [];
      
      // For all report types, include financial charts
      chartSections.push(
        { type: 'revenue-income', title: 'Revenue and Income Trends' },
        { type: 'assets-liabilities', title: 'Assets and Liabilities' }
      );
      
      // For comprehensive and financial reports, add more detailed charts
      if (reportType === 'comprehensive' || reportType === 'financial') {
        chartSections.push(
          { type: 'profitability', title: 'Profitability Metrics' },
          { type: 'cash-flow', title: 'Cash Flow Analysis' }
        );
      }
      
      // For comprehensive and growth-focused reports
      if (reportType === 'comprehensive' || reportType === 'growth') {
        chartSections.push(
          { type: 'growth', title: 'Growth Trends' }
        );
      }
      
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
        peers: data.peers
      };
      
      // Add report type to help the AI generate appropriate content
      const requestWithType = {
        ...reportRequest,
        reportType,
        includeCharts: chartSections.map(c => c.type)
      };
      
      const generatedReport = await generateResearchReport(requestWithType);
      
      if (!generatedReport) {
        throw new Error("Failed to generate report");
      }
      
      // Add chart sections to the generated report
      const reportWithCharts = {
        ...generatedReport,
        chartSections
      };
      
      setReport(reportWithCharts);
      
      toast({
        title: "Report Generated",
        description: "Research report has been successfully generated.",
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

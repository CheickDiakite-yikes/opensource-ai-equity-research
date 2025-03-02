
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { FileText } from "lucide-react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ReportGeneratorForm from "@/components/reports/ReportGeneratorForm";
import ReportTabs from "@/components/reports/ReportTabs";

import { 
  fetchStockProfile, 
  fetchStockQuote, 
  fetchIncomeStatements, 
  fetchBalanceSheets, 
  fetchCashFlowStatements, 
  fetchKeyRatios, 
  fetchCompanyNews, 
  fetchCompanyPeers, 
  generateResearchReport,
  generateStockPrediction
} from "@/services/api";

import type { 
  StockProfile, 
  StockQuote, 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement, 
  KeyRatio, 
  NewsArticle, 
  ReportRequest, 
  ResearchReport,
  StockPrediction
} from "@/types";

interface ResearchReportGeneratorProps {
  symbol: string;
}

const ResearchReportGenerator = ({ symbol }: ResearchReportGeneratorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [reportType, setReportType] = useState<string>("comprehensive");
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [data, setData] = useState<{
    profile: StockProfile | null;
    quote: StockQuote | null;
    income: IncomeStatement[];
    balance: BalanceSheet[];
    cashflow: CashFlowStatement[];
    ratios: KeyRatio[];
    news: NewsArticle[];
    peers: string[];
  }>({
    profile: null,
    quote: null,
    income: [],
    balance: [],
    cashflow: [],
    ratios: [],
    news: [],
    peers: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [
          profile,
          quote,
          income,
          balance,
          cashflow,
          ratios,
          news,
          peers
        ] = await Promise.all([
          fetchStockProfile(symbol),
          fetchStockQuote(symbol),
          fetchIncomeStatements(symbol),
          fetchBalanceSheets(symbol),
          fetchCashFlowStatements(symbol),
          fetchKeyRatios(symbol),
          fetchCompanyNews(symbol),
          fetchCompanyPeers(symbol)
        ]);
        
        if (!profile || !quote) {
          throw new Error(`Failed to fetch data for ${symbol}`);
        }
        
        setData({
          profile,
          quote,
          income,
          balance,
          cashflow,
          ratios,
          news,
          peers
        });
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

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
        peers: data.peers
      };
      
      const generatedReport = await generateResearchReport(reportRequest);
      
      if (!generatedReport) {
        throw new Error("Failed to generate report");
      }
      
      setReport(generatedReport);
      
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
        ratios: data.ratios
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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  const hasStockData = Boolean(data.profile && data.quote);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Research Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReportGeneratorForm 
            reportType={reportType}
            setReportType={setReportType}
            onGenerateReport={handleGenerateReport}
            onPredictPrice={handlePredictPrice}
            isGenerating={isGenerating}
            isPredicting={isPredicting}
            hasData={hasStockData}
          />
          
          <ReportTabs report={report} prediction={prediction} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchReportGenerator;

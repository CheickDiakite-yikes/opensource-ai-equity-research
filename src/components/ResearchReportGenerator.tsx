import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { FileText, AlertCircle } from "lucide-react";
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
  generateStockPrediction,
  fetchEarningsTranscripts,
  fetchSECFilings
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
  StockPrediction,
  EarningsCall,
  SECFiling
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
    transcripts: EarningsCall[];
    filings: SECFiling[];
  }>({
    profile: null,
    quote: null,
    income: [],
    balance: [],
    cashflow: [],
    ratios: [],
    news: [],
    peers: [],
    transcripts: [],
    filings: []
  });
  const [error, setError] = useState<string | null>(null);
  const [dataLoadingStatus, setDataLoadingStatus] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setDataLoadingStatus({});
        
        const statusTracker: {[key: string]: string} = {};
        const updateStatus = (key: string, status: string) => {
          statusTracker[key] = status;
          setDataLoadingStatus({...statusTracker});
        };
        
        const fetchWithStatus = async <T,>(
          key: string, 
          fetchFn: () => Promise<T>,
          errorValue: T
        ): Promise<T> => {
          try {
            updateStatus(key, 'loading');
            const result = await fetchFn();
            updateStatus(key, result ? 'success' : 'empty');
            return result;
          } catch (err) {
            console.error(`Error fetching ${key}:`, err);
            updateStatus(key, 'error');
            return errorValue;
          }
        };
        
        const [profile, quote] = await Promise.all([
          fetchWithStatus('profile', () => fetchStockProfile(symbol), null),
          fetchWithStatus('quote', () => fetchStockQuote(symbol), null)
        ]);
        
        if (!profile || !quote) {
          throw new Error(`Could not fetch core data for ${symbol}`);
        }
        
        const [income, balance, cashflow, ratios, news, peers, transcripts, filings] = await Promise.all([
          fetchWithStatus('income', () => fetchIncomeStatements(symbol), []),
          fetchWithStatus('balance', () => fetchBalanceSheets(symbol), []),
          fetchWithStatus('cashflow', () => fetchCashFlowStatements(symbol), []),
          fetchWithStatus('ratios', () => fetchKeyRatios(symbol), []),
          fetchWithStatus('news', () => fetchCompanyNews(symbol), []),
          fetchWithStatus('peers', () => fetchCompanyPeers(symbol), []),
          fetchWithStatus('transcripts', () => fetchEarningsTranscripts(symbol), []),
          fetchWithStatus('filings', () => fetchSECFilings(symbol), [])
        ]);
        
        setData({
          profile,
          quote,
          income,
          balance,
          cashflow,
          ratios,
          news,
          peers,
          transcripts,
          filings
        });
        
        console.log(`Data loaded for ${symbol}:`, {
          profile: !!profile,
          quote: !!quote,
          income: income.length,
          balance: balance.length,
          cashflow: cashflow.length,
          ratios: ratios.length,
          news: news.length,
          peers: peers.length,
          transcripts: transcripts.length,
          filings: filings.length
        });
        
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError(err.message);
        toast({
          title: "Error Loading Data",
          description: `Failed to load data for ${symbol}: ${err.message}`,
          variant: "destructive",
        });
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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  const hasStockData = Boolean(data.profile && data.quote);
  const hasFinancialData = data.income.length > 0 && data.balance.length > 0;
  const showDataWarning = hasStockData && !hasFinancialData;

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
          {showDataWarning && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
              <div className="flex">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>Limited financial data available. Report accuracy may be affected.</p>
              </div>
            </div>
          )}
          
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

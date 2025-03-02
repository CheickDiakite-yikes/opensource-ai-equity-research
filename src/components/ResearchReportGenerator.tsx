
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { generateReportHTML, formatDate } from "@/lib/utils";
import { FileText, Download, Check, Info, AlertTriangle, ArrowRight } from "lucide-react";
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

  const downloadAsHTML = () => {
    if (!report) return;
    
    const title = `${report.companyName} (${report.symbol}) - Equity Research Report`;
    
    let content = `<h1>${title}</h1>`;
    content += `<p class="date">Date: ${report.date}</p>`;
    content += `<p class="recommendation"><strong>Recommendation:</strong> ${report.recommendation}</p>`;
    content += `<p class="price-target"><strong>Price Target:</strong> ${report.targetPrice}</p>`;
    
    content += `<div class="summary">
      <h2>Executive Summary</h2>
      <p>${report.summary}</p>
    </div>`;
    
    report.sections.forEach(section => {
      content += `<div class="section">
        <h2>${section.title}</h2>
        <div>${section.content}</div>
      </div>`;
    });
    
    const htmlContent = generateReportHTML(title, content);
    
    // Create a Blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${symbol}_research_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Research report has been downloaded as HTML.",
    });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Report Type</label>
                <Select defaultValue={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                    <SelectItem value="financial">Financial Focus</SelectItem>
                    <SelectItem value="valuation">Valuation Focus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2">
                <Button 
                  className="w-full"
                  onClick={handleGenerateReport}
                  disabled={isGenerating || !data.profile}
                >
                  {isGenerating ? "Generating..." : "Generate Research Report"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Creates a professional equity research report with investment thesis, financials, and price target.</span>
              </div>
              
              <div className="rounded-lg border p-3 bg-muted/30">
                <h4 className="text-sm font-medium mb-2">Data Sources</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                    <span className="text-xs">Financial Statements</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                    <span className="text-xs">Key Ratios</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                    <span className="text-xs">News & Events</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                    <span className="text-xs">Market Data</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handlePredictPrice}
                  disabled={isPredicting || !data.profile}
                >
                  {isPredicting ? "Predicting..." : "Generate Price Prediction"}
                </Button>
              </div>
            </div>
          </div>
          
          {(report || prediction) && (
            <Tabs defaultValue={report ? "report" : "prediction"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="report" disabled={!report}>Research Report</TabsTrigger>
                <TabsTrigger value="prediction" disabled={!prediction}>Price Prediction</TabsTrigger>
              </TabsList>
              
              <TabsContent value="report" className="mt-4">
                {report && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold">{report.companyName} ({report.symbol})</h2>
                        <p className="text-sm text-muted-foreground">Report Date: {report.date}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={downloadAsHTML}>
                        <Download className="h-4 w-4 mr-1.5" />
                        Download Report
                      </Button>
                    </div>
                    
                    <div className="flex space-x-4">
                      <div className="p-3 border rounded-lg">
                        <span className="text-xs text-muted-foreground block mb-1">Recommendation</span>
                        <span className="text-xl font-semibold">{report.recommendation}</span>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <span className="text-xs text-muted-foreground block mb-1">Price Target</span>
                        <span className="text-xl font-semibold">{report.targetPrice}</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-2">Executive Summary</h3>
                      <p className="text-sm leading-relaxed">{report.summary}</p>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted p-3">
                        <h3 className="font-medium">Report Sections</h3>
                      </div>
                      <div className="divide-y">
                        {report.sections.map((section, index) => (
                          <details key={index} className="group">
                            <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                              <h4 className="font-medium">{section.title}</h4>
                              <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="p-4 pt-0">
                              <div 
                                className="text-sm text-muted-foreground prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br>') }}
                              />
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 border-amber-200 border rounded-lg p-3 text-xs text-amber-800">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                        <p>
                          This report is generated using AI and should not be the sole basis for investment decisions.
                          Always conduct your own research and consult with a financial advisor.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="prediction" className="mt-4">
                {prediction && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold">{symbol} - Price Prediction</h2>
                        <p className="text-sm text-muted-foreground">Current Price: {prediction.currentPrice.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 border rounded-lg">
                        <span className="text-xs text-muted-foreground block mb-1">1 Month</span>
                        <span className={`text-lg font-semibold ${prediction.predictedPrice.oneMonth > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                          ${prediction.predictedPrice.oneMonth.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <span className="text-xs text-muted-foreground block mb-1">3 Months</span>
                        <span className={`text-lg font-semibold ${prediction.predictedPrice.threeMonths > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                          ${prediction.predictedPrice.threeMonths.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <span className="text-xs text-muted-foreground block mb-1">6 Months</span>
                        <span className={`text-lg font-semibold ${prediction.predictedPrice.sixMonths > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                          ${prediction.predictedPrice.sixMonths.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <span className="text-xs text-muted-foreground block mb-1">1 Year</span>
                        <span className={`text-lg font-semibold ${prediction.predictedPrice.oneYear > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                          ${prediction.predictedPrice.oneYear.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <Info className="h-4 w-4 mr-1.5" />
                          Sentiment Analysis
                        </h3>
                        <p className="text-sm text-muted-foreground">{prediction.sentimentAnalysis}</p>
                        <div className="mt-3">
                          <span className="text-xs text-muted-foreground">Confidence Level</span>
                          <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${prediction.confidenceLevel}%` }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1 block">{prediction.confidenceLevel}%</span>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Key Drivers</h3>
                        <ul className="space-y-1">
                          {prediction.keyDrivers.map((driver, index) => (
                            <li key={index} className="text-sm flex items-start">
                              <Check className="h-4 w-4 mr-1.5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{driver}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="text-sm font-medium mb-2">Potential Risks</h3>
                      <ul className="space-y-2">
                        {prediction.risks.map((risk, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 border-amber-200 border rounded-lg p-3 text-xs text-amber-800">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                        <p>
                          These predictions are generated using AI and historical data. Markets are unpredictable and
                          future performance may vary significantly. This should not be the sole basis for investment decisions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
    <Skeleton className="h-60 w-full" />
  </div>
);

export default ResearchReportGenerator;

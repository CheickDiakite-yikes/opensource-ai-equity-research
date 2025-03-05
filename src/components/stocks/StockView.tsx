import React from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResearchReportData } from "@/components/reports/useResearchReportData";
import { useReportGeneration } from "@/components/reports/useReportGeneration";
import StockOverview from "@/components/StockOverview";
import FinancialTabContent from "@/components/sections/FinancialTabContent";
import NewsTabContent from "@/components/sections/NewsTabContent";
import DocumentsTabContent from "@/components/sections/DocumentsTabContent";
import DCFTabContent from "@/components/sections/DCFTabContent";
import ReportTabContent from "@/components/sections/ReportTabContent";
import PredictionTabContent from "@/components/sections/PredictionTabContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const StockView = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const normalizedSymbol = symbol?.toUpperCase() || "";
  
  const {
    isLoading,
    data,
    error,
    dataLoadingStatus,
    hasStockData,
    hasFinancialData,
    showDataWarning
  } = useResearchReportData(normalizedSymbol);
  
  const {
    isGenerating,
    isPredicting,
    report,
    prediction,
    reportType,
    setReportType,
    handleGenerateReport,
    handlePredictPrice
  } = useReportGeneration(normalizedSymbol, data);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <Skeleton className="h-[300px] w-full rounded-lg" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }
  
  if (error || !hasStockData) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || `Could not load data for ${normalizedSymbol}`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <StockOverview symbol={normalizedSymbol} />
      
      {showDataWarning && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Limited financial data available for {normalizedSymbol}. Some features may not work properly.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <ReportTabContent 
            symbol={normalizedSymbol}
            profile={data.profile}
            report={report}
            isGenerating={isGenerating}
            onGenerate={handleGenerateReport}
            reportType={reportType}
            setReportType={setReportType}
          />
        </TabsContent>
        
        <TabsContent value="financials">
          <FinancialTabContent 
            symbol={normalizedSymbol}
            income={data.income}
            balance={data.balance}
            cashflow={data.cashflow}
            ratios={data.ratios}
            isLoading={dataLoadingStatus.income === 'loading' || dataLoadingStatus.balance === 'loading'}
          />
        </TabsContent>
        
        <TabsContent value="news">
          <NewsTabContent 
            symbol={normalizedSymbol}
            news={data.news}
            isLoading={dataLoadingStatus.news === 'loading'}
          />
        </TabsContent>
        
        <TabsContent value="documents">
          <DocumentsTabContent 
            symbol={normalizedSymbol}
            transcripts={data.transcripts}
            filings={data.filings}
            isLoading={dataLoadingStatus.transcripts === 'loading' || dataLoadingStatus.filings === 'loading'}
          />
        </TabsContent>
        
        <TabsContent value="valuation">
          <DCFTabContent 
            financials={data.income}
            symbol={normalizedSymbol}
            quoteData={data.quote}
          />
        </TabsContent>
        
        <TabsContent value="ai-analysis">
          <PredictionTabContent 
            symbol={normalizedSymbol}
            prediction={prediction}
            isPredicting={isPredicting}
            onPredict={handlePredictPrice}
            quote={data.quote}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockView;

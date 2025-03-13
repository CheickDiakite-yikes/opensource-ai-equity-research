import React, { useEffect } from "react";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { useReportSaving } from "@/hooks/reports/useReportSaving";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyOverview from "./report-sections/CompanyOverview";
import FinancialAnalysis from "./report-sections/FinancialAnalysis";
import InvestmentAnalysis from "./report-sections/InvestmentAnalysis";
import RiskAssessment from "./report-sections/RiskAssessment";
import TechnicalAnalysis from "./report-sections/TechnicalAnalysis";
import ValuationAnalysis from "./report-sections/ValuationAnalysis";
import ReportSummary from "./report-sections/ReportSummary";
import ReportHeader from "./report-sections/ReportHeader";

interface ResearchReportContentProps {
  report: ResearchReport;
  symbol: string;
  companyName: string;
  htmlContent?: string | null;
  onDownloadHtml?: () => void;
}

const ResearchReportContent: React.FC<ResearchReportContentProps> = ({
  report,
  symbol,
  companyName,
  htmlContent,
  onDownloadHtml
}) => {
  const { autoSaveReport, isSaving } = useReportSaving();

  // Auto-save the report when it's first displayed
  useEffect(() => {
    if (report && symbol && companyName) {
      console.log("Auto-saving report on display:", symbol);
      autoSaveReport(symbol, companyName, report);
    }
  }, [report, symbol, companyName]);

  // Format the report date
  const reportDate = report.reportDate ? formatDate(new Date(report.reportDate)) : formatDate(new Date());

  return (
    <div className="space-y-6 pb-8">
      {isSaving && (
        <div className="text-xs text-muted-foreground animate-pulse">
          Saving report...
        </div>
      )}
      
      <ReportHeader 
        symbol={symbol} 
        companyName={companyName} 
        reportDate={reportDate}
        targetPrice={report.targetPrice}
        recommendation={report.recommendation}
      />

      {onDownloadHtml && htmlContent && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownloadHtml}
            className="text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Download HTML
          </Button>
        </div>
      )}

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-0">
          <ReportSummary 
            summary={report.executiveSummary} 
            highlights={report.investmentHighlights}
            recommendation={report.recommendation}
            targetPrice={report.targetPrice}
          />
        </TabsContent>
        
        <TabsContent value="company" className="mt-0">
          <CompanyOverview 
            companyDescription={report.companyDescription}
            businessModel={report.businessModel}
            productsServices={report.productsServices}
            industryOverview={report.industryOverview}
            competitiveLandscape={report.competitiveLandscape}
          />
        </TabsContent>
        
        <TabsContent value="financial" className="mt-0">
          <FinancialAnalysis 
            financialSummary={report.financialSummary}
            revenueAnalysis={report.revenueAnalysis}
            profitabilityAnalysis={report.profitabilityAnalysis}
            balanceSheetAnalysis={report.balanceSheetAnalysis}
            cashFlowAnalysis={report.cashFlowAnalysis}
          />
        </TabsContent>
        
        <TabsContent value="valuation" className="mt-0">
          <ValuationAnalysis 
            valuationSummary={report.valuationSummary}
            peRatio={report.peRatio}
            pbRatio={report.pbRatio}
            evToEbitda={report.evToEbitda}
            dividendYield={report.dividendYield}
            discountedCashFlow={report.discountedCashFlow}
            priceForecast={report.priceForecast}
          />
        </TabsContent>
        
        <TabsContent value="technical" className="mt-0">
          <TechnicalAnalysis 
            technicalSummary={report.technicalSummary}
            trendAnalysis={report.trendAnalysis}
            supportResistanceLevels={report.supportResistanceLevels}
            movingAverages={report.movingAverages}
            relativeStrengthIndex={report.relativeStrengthIndex}
            macdAnalysis={report.macdAnalysis}
          />
        </TabsContent>
        
        <TabsContent value="investment" className="mt-0">
          <InvestmentAnalysis 
            investmentThesis={report.investmentThesis}
            growthProspects={report.growthProspects}
            competitiveAdvantages={report.competitiveAdvantages}
            catalysts={report.catalysts}
          />
        </TabsContent>
        
        <TabsContent value="risk" className="mt-0">
          <RiskAssessment 
            riskSummary={report.riskSummary}
            marketRisks={report.marketRisks}
            businessRisks={report.businessRisks}
            financialRisks={report.financialRisks}
            regulatoryRisks={report.regulatoryRisks}
          />
        </TabsContent>
      </Tabs>
      
      <div className="text-xs text-muted-foreground mt-8 pt-4 border-t border-border">
        <p>This report was generated using AI and should not be considered as financial advice. Always conduct your own research before making investment decisions.</p>
        <p>Report generated on {reportDate} for {companyName} ({symbol}).</p>
      </div>
    </div>
  );
};

export default ResearchReportContent;

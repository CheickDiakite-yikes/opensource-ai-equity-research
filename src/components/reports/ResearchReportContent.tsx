
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
import { Skeleton } from "@/components/ui/skeleton";

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
  }, [report, symbol, companyName, autoSaveReport]);

  // Format the report date
  const reportDate = report.date ? report.date : formatDate(new Date().toISOString());

  const findSectionContent = (title: string): string => {
    const section = report.sections.find(s => 
      s.title.toLowerCase().includes(title.toLowerCase())
    );
    return section?.content || "No information available";
  };

  return (
    <div className="space-y-6 pb-8">
      {isSaving && (
        <div className="text-xs text-muted-foreground animate-pulse">
          Saving report...
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{companyName} ({symbol})</h2>
          <p className="text-sm text-muted-foreground">Report Date: {reportDate}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge 
            className={`px-2.5 py-1 font-semibold ${
              report.recommendation.toLowerCase().includes('buy') ? 'bg-green-100 text-green-800' :
              report.recommendation.toLowerCase().includes('hold') ? 'bg-yellow-100 text-yellow-800' :
              report.recommendation.toLowerCase().includes('sell') ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}
            variant="outline"
          >
            {report.recommendation}
          </Badge>
          
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Price Target</div>
            <div className="text-lg font-semibold">{report.targetPrice}</div>
          </div>
        </div>
      </div>

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
      
      <Card className="p-4 bg-primary/5">
        <h3 className="font-semibold mb-2">Executive Summary</h3>
        <p className="text-sm text-muted-foreground">{report.summary}</p>
      </Card>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company" className="mt-0 space-y-4">
          {report.sections.filter(s => 
            s.title.toLowerCase().includes('company') || 
            s.title.toLowerCase().includes('business') ||
            s.title.toLowerCase().includes('product') ||
            s.title.toLowerCase().includes('industry')
          ).map((section, index) => (
            <Card key={index} className="p-4">
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.content}</p>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="financial" className="mt-0 space-y-4">
          {report.sections.filter(s => 
            s.title.toLowerCase().includes('financial') || 
            s.title.toLowerCase().includes('revenue') ||
            s.title.toLowerCase().includes('profit') ||
            s.title.toLowerCase().includes('balance sheet') ||
            s.title.toLowerCase().includes('cash flow')
          ).map((section, index) => (
            <Card key={index} className="p-4">
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.content}</p>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="valuation" className="mt-0 space-y-4">
          {report.sections.filter(s => 
            s.title.toLowerCase().includes('valuation') || 
            s.title.toLowerCase().includes('price') ||
            s.title.toLowerCase().includes('ratio') ||
            s.title.toLowerCase().includes('metrics')
          ).map((section, index) => (
            <Card key={index} className="p-4">
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.content}</p>
            </Card>
          ))}
          
          {report.scenarioAnalysis && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Scenario Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="p-3 border rounded bg-green-50">
                  <h4 className="font-medium">Bull Case: {report.scenarioAnalysis.bullCase.price}</h4>
                  <p className="text-xs mt-1">{report.scenarioAnalysis.bullCase.description}</p>
                </div>
                <div className="p-3 border rounded bg-blue-50">
                  <h4 className="font-medium">Base Case: {report.scenarioAnalysis.baseCase.price}</h4>
                  <p className="text-xs mt-1">{report.scenarioAnalysis.baseCase.description}</p>
                </div>
                <div className="p-3 border rounded bg-red-50">
                  <h4 className="font-medium">Bear Case: {report.scenarioAnalysis.bearCase.price}</h4>
                  <p className="text-xs mt-1">{report.scenarioAnalysis.bearCase.description}</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="growth" className="mt-0 space-y-4">
          {report.sections.filter(s => 
            s.title.toLowerCase().includes('growth') || 
            s.title.toLowerCase().includes('investment') ||
            s.title.toLowerCase().includes('prospect') ||
            s.title.toLowerCase().includes('future') ||
            s.title.toLowerCase().includes('strategy')
          ).map((section, index) => (
            <Card key={index} className="p-4">
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.content}</p>
            </Card>
          ))}
          
          {report.catalysts && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Growth Catalysts</h3>
              
              {report.catalysts.positive && report.catalysts.positive.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium text-sm">Positive Catalysts</h4>
                  <ul className="list-disc pl-5 text-sm mt-1">
                    {report.catalysts.positive.map((item, idx) => (
                      <li key={idx} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {report.catalysts.negative && report.catalysts.negative.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-sm">Negative Catalysts</h4>
                  <ul className="list-disc pl-5 text-sm mt-1">
                    {report.catalysts.negative.map((item, idx) => (
                      <li key={idx} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="risk" className="mt-0 space-y-4">
          {report.sections.filter(s => 
            s.title.toLowerCase().includes('risk') || 
            s.title.toLowerCase().includes('challenge') ||
            s.title.toLowerCase().includes('threat') ||
            s.title.toLowerCase().includes('concern')
          ).map((section, index) => (
            <Card key={index} className="p-4">
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.content}</p>
            </Card>
          ))}
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

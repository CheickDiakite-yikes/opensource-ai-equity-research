
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReportHeader } from "./ReportHeader";
import { ReportSectionsList } from "./ReportSectionsList";
import PricePredictionDisplay from "./PricePredictionDisplay";
import { GrowthCatalysts } from "./GrowthCatalysts";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { DisclaimerSection } from "./DisclaimerSection";
import ReportGeneratorForm from "./ReportGeneratorForm";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import type { ReportData } from "./useResearchReportData";

interface ResearchReportContentProps {
  data: ReportData;
  showDataWarning: boolean;
  isGenerating: boolean;
  isPredicting: boolean;
  hasStockData: boolean;
  reportType: string;
  setReportType: React.Dispatch<React.SetStateAction<string>>;
  onGenerateReport: () => void;
  onPredictPrice: () => void;
  report: ResearchReport | null;
  prediction: StockPrediction | null;
  isReportTooBasic: boolean;
  generationError: string | null;
}

const ResearchReportContent: React.FC<ResearchReportContentProps> = ({
  data,
  showDataWarning,
  isGenerating,
  isPredicting,
  hasStockData,
  reportType,
  setReportType,
  onGenerateReport,
  onPredictPrice,
  report,
  prediction,
  isReportTooBasic,
  generationError
}) => {
  return (
    <div className="w-full space-y-6">
      {showDataWarning && (
        <Alert className="mb-6 bg-amber-50 border-amber-300">
          <AlertDescription>
            Limited financial data available for this company. The report may not include 
            detailed financial analysis.
          </AlertDescription>
        </Alert>
      )}

      {!report && !prediction ? (
        <>
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Research Report Generator</CardTitle>
              <CardDescription>
                Generate a comprehensive AI-powered investment research report for {data.profile?.companyName || data.profile?.symbol}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportGeneratorForm
                reportType={reportType}
                setReportType={setReportType}
                onGenerateReport={onGenerateReport}
                onPredictPrice={onPredictPrice}
                isGenerating={isGenerating}
                isPredicting={isPredicting}
                hasData={hasStockData}
              />

              {generationError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>
                    Error generating report: {generationError}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Tabs defaultValue={report ? "report" : "prediction"} className="w-full">
          <TabsList className="mb-4">
            {report && <TabsTrigger value="report">Research Report</TabsTrigger>}
            {prediction && <TabsTrigger value="prediction">Price Prediction</TabsTrigger>}
          </TabsList>

          {report && (
            <TabsContent value="report" className="space-y-6">
              <ReportHeader 
                companyName={report.companyName}
                symbol={report.symbol}
                date={report.date}
                recommendation={report.recommendation}
                targetPrice={report.targetPrice}
                ratingDetails={report.ratingDetails}
              />
              
              {isReportTooBasic && (
                <Alert className="mb-6 bg-amber-50 border-amber-300">
                  <AlertDescription>
                    Note: This is a basic report. Some details may be limited due to data availability or complexity.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <ReportSectionsList report={report} expandedScenarios={null} toggleScenario={() => {}} />
                </div>
                
                <div className="space-y-6">
                  {report.ratingDetails && (
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Rating Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Overall Rating:</dt>
                            <dd>{report.ratingDetails.overallRating}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Financial Strength:</dt>
                            <dd>{report.ratingDetails.financialStrength}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Growth Outlook:</dt>
                            <dd>{report.ratingDetails.growthOutlook}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Valuation:</dt>
                            <dd>{report.ratingDetails.valuationAttractiveness}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Competitive Position:</dt>
                            <dd>{report.ratingDetails.competitivePosition}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  )}
                  
                  {report.scenarioAnalysis && (
                    <SensitivityAnalysis 
                      scenarioAnalysis={report.scenarioAnalysis} 
                      expandedScenarios={null} 
                      toggleScenario={() => {}} 
                    />
                  )}
                  
                  {report.catalysts && (
                    <GrowthCatalysts catalysts={report.catalysts} />
                  )}
                </div>
              </div>
              
              <DisclaimerSection />
              
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={onPredictPrice}
                  disabled={isPredicting}
                >
                  {isPredicting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Price Prediction...
                    </>
                  ) : (
                    "Generate AI Price Prediction"
                  )}
                </Button>
              </div>
            </TabsContent>
          )}
          
          {prediction && (
            <TabsContent value="prediction">
              <PricePredictionDisplay prediction={prediction} />
              
              {!report && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={onGenerateReport}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Full Report...
                      </>
                    ) : (
                      "Generate Full Research Report"
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default ResearchReportContent;

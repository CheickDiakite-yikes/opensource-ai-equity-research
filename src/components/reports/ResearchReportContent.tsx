
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReportGeneratorForm from "./ReportGeneratorForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportTabs from "./ReportTabs";
import { FileText, Info, TrendingUp, AlertTriangle } from "lucide-react";
import {
  ResearchReport,
  StockProfile,
  StockQuote,
  StockPrediction,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyRatio,
  NewsArticle,
} from "@/types";
import { ReportData } from "./useResearchReportData";
import { motion } from "framer-motion";

interface ResearchReportContentProps {
  data: ReportData;
  showDataWarning: boolean;
  isGenerating: boolean;
  isPredicting: boolean;
  hasStockData: boolean;
  reportType: string;
  setReportType: React.Dispatch<React.SetStateAction<string>>;
  onGenerateReport: () => Promise<void>;
  onPredictPrice: () => Promise<void>;
  report: ResearchReport | null;
  prediction: StockPrediction | null;
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
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Research Report Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                AI-Generated Research Report
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Creates a detailed equity research report with company analysis, financial review, valuation, and
                investment recommendation. Includes visualizations of key financial metrics.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Report Focus</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="comprehensive"
                        value="comprehensive"
                        checked={reportType === "comprehensive"}
                        onChange={() => setReportType("comprehensive")}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor="comprehensive"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Comprehensive Analysis
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="financialFocus"
                        value="financialFocus"
                        checked={reportType === "financialFocus"}
                        onChange={() => setReportType("financialFocus")}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor="financialFocus"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Financial Focus
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="growthFocus"
                        value="growthFocus"
                        checked={reportType === "growthFocus"}
                        onChange={() => setReportType("growthFocus")}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor="growthFocus"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Growth & Opportunities Focus
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={onGenerateReport}
                  className="w-full"
                  disabled={isGenerating || !hasStockData}
                >
                  {isGenerating ? "Generating..." : "Generate Research Report"}
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                AI-Powered Price Forecasting
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Creates a price prediction based on financial data, market trends, and advanced analysis algorithms.
                Evaluates various time horizons and provides confidence levels.
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Data Sources</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${hasStockData ? "bg-green-500" : "bg-gray-300"}`}></div>
                    </div>
                    <span>Financial Statements</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${data.news.length > 0 ? "bg-green-500" : "bg-gray-300"}`}></div>
                    </div>
                    <span>News & Events</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${data.ratios.length > 0 ? "bg-green-500" : "bg-gray-300"}`}></div>
                    </div>
                    <span>Key Ratios</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${data.peers.length > 0 ? "bg-green-500" : "bg-gray-300"}`}></div>
                    </div>
                    <span>Market Data</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={onPredictPrice}
                variant="outline"
                className="w-full border-primary/20 hover:bg-primary/5"
                disabled={isPredicting || !hasStockData}
              >
                {isPredicting ? "Generating..." : "Generate Price Prediction"}
              </Button>
            </div>
          </div>

          {showDataWarning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2"
            >
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Limited financial data available</p>
                <p className="mt-1">
                  We couldn't find complete financial statements for this company. The report will be based on limited data
                  and may not be as comprehensive.
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <ReportTabs report={report} prediction={prediction} />
    </div>
  );
};

export default ResearchReportContent;


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle, RefreshCw } from "lucide-react";
import ReportGeneratorForm from "@/components/reports/ReportGeneratorForm";
import ReportTabs from "@/components/reports/ReportTabs";
import { ReportData } from "./useResearchReportData";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ResearchReportContentProps {
  data: ReportData;
  showDataWarning: boolean;
  isGenerating: boolean;
  isPredicting: boolean;
  hasStockData: boolean;
  reportType: string;
  setReportType: (value: string) => void;
  onGenerateReport: () => void;
  onPredictPrice: () => void;
  report: ResearchReport | null;
  prediction: StockPrediction | null;
  isReportTooBasic?: boolean;
  generationError?: string | null;
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
  isReportTooBasic = false,
  generationError = null
}) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-border/60 shadow-md">
          <CardHeader className="bg-gradient-to-r from-didi.darkBlue/10 to-didi.lightBlue/5 border-b border-border/30">
            <CardTitle className="flex items-center">
              <img 
                src="/lovable-uploads/288626b2-84b1-4aca-9399-864c39d76976.png" 
                alt="DiDi Equity Research" 
                className="h-7 mr-3" 
              />
              <span className="text-didi.darkBlue">Research Report Generator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {showDataWarning && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm"
              >
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>Limited financial data available. Report accuracy may be affected.</p>
                </div>
              </motion.div>
            )}
            
            {generationError && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm"
              >
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error generating report</p>
                    <p className="mt-1">{generationError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-xs"
                      onClick={onGenerateReport}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" /> Try again
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {isReportTooBasic && report && !isGenerating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm"
              >
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Basic report detected</p>
                    <p className="mt-1">This report appears to be missing some detailed sections typically found in professional equity research. Consider regenerating with more detailed options.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-xs"
                      onClick={onGenerateReport}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" /> Regenerate with more detail
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            
            <ReportGeneratorForm 
              reportType={reportType}
              setReportType={setReportType}
              onGenerateReport={onGenerateReport}
              onPredictPrice={onPredictPrice}
              isGenerating={isGenerating}
              isPredicting={isPredicting}
              hasData={hasStockData}
            />
            
            <ReportTabs report={report} prediction={prediction} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResearchReportContent;


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";
import ReportGeneratorForm from "@/components/reports/ReportGeneratorForm";
import ReportTabs from "@/components/reports/ReportTabs";
import { ReportData } from "./useResearchReportData";
import { ResearchReport } from "@/types/aiAnalysisTypes";
import { StockPrediction } from "@/types/aiAnalysisTypes";
import { motion } from "framer-motion";

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
  prediction
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

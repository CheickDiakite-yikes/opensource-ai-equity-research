
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Check } from "lucide-react";

interface ReportGeneratorFormProps {
  reportType: string;
  setReportType: (value: string) => void;
  onGenerateReport: () => void;
  onPredictPrice: () => void;
  isGenerating: boolean;
  isPredicting: boolean;
  hasData: boolean;
}

const ReportGeneratorForm: React.FC<ReportGeneratorFormProps> = ({
  reportType,
  setReportType,
  onGenerateReport,
  onPredictPrice,
  isGenerating,
  isPredicting,
  hasData
}) => {
  return (
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
            onClick={onGenerateReport}
            disabled={isGenerating || !hasData}
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
            onClick={onPredictPrice}
            disabled={isPredicting || !hasData}
          >
            {isPredicting ? "Predicting..." : "Generate Price Prediction"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorForm;

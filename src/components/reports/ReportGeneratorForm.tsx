
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Check, FileText, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="space-y-4 p-5 rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Research Report
          </h3>
          {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Report Focus</label>
          <Select defaultValue={reportType} onValueChange={setReportType}>
            <SelectTrigger className="bg-background/80 focus:ring-primary">
              <SelectValue placeholder="Select Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comprehensive">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Comprehensive Analysis
                </span>
              </SelectItem>
              <SelectItem value="financial">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Financial Focus
                </span>
              </SelectItem>
              <SelectItem value="valuation">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Valuation Focus
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="pt-2">
          <Button 
            className={cn(
              "w-full flex items-center gap-2 transition-all",
              isGenerating ? "bg-primary/80" : "bg-primary hover:bg-primary/90"
            )}
            onClick={onGenerateReport}
            disabled={isGenerating || !hasData}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Generate Research Report</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-4 p-5 rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm">
        <h3 className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Price Prediction
          {isPredicting && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
        </h3>
        
        <div className="flex items-start gap-2 text-sm text-muted-foreground rounded-md p-3 bg-muted/30">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Creates a price prediction based on financial data, market trends, and advanced analysis algorithms.</span>
        </div>
        
        <div className="rounded-lg border p-3 bg-muted/20">
          <h4 className="text-sm font-medium mb-2 text-foreground/80">Data Sources</h4>
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
            className={cn(
              "w-full border-primary/30 hover:bg-primary/10 flex items-center gap-2",
              isPredicting && "opacity-80"
            )}
            onClick={onPredictPrice}
            disabled={isPredicting || !hasData}
          >
            {isPredicting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Predicting...</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                <span>Generate Price Prediction</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorForm;

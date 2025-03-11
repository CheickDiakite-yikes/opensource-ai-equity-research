import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Check, FileText, TrendingUp, Loader2, AlertTriangle, Save, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  canGenerateReport,
  canGeneratePrediction,
  getRemainingPredictions
} from "@/services/api/userContent/freePredictionsService";

interface ReportGeneratorFormProps {
  reportType: string;
  setReportType: (value: string) => void;
  onGenerateReport: () => void;
  onPredictPrice: () => void;
  isGenerating: boolean;
  isPredicting: boolean;
  hasData: boolean;
  onSaveReport?: () => void;
  onSavePrediction?: () => void;
  canSaveReport?: boolean;
  canSavePrediction?: boolean;
}

const ReportGeneratorForm: React.FC<ReportGeneratorFormProps> = ({
  reportType,
  setReportType,
  onGenerateReport,
  onPredictPrice,
  isGenerating,
  isPredicting,
  hasData,
  onSaveReport,
  onSavePrediction,
  canSaveReport = false,
  canSavePrediction = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const remainingPredictions = getRemainingPredictions();
  const isAuthenticated = !!user;
  
  const handleGenerateReport = () => {
    if (canGenerateReport(isAuthenticated)) {
      onGenerateReport();
    } else {
      // Redirect to auth page
      navigate('/auth');
    }
  };
  
  const handlePredictPrice = () => {
    if (canGeneratePrediction(isAuthenticated)) {
      onPredictPrice();
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "grid gap-6 mb-8",
        isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
      )}
    >
      <div className="space-y-4 p-3 sm:p-5 rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {isMobile ? "Research" : "Research Report"}
            {!isAuthenticated && (
              <div className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                <span>Premium</span>
              </div>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {isGenerating && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Processing</span>
              </div>
            )}
            
            {canSaveReport && user && onSaveReport && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs" 
                onClick={onSaveReport}
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Report Focus</label>
          <Select defaultValue={reportType} onValueChange={setReportType}>
            <SelectTrigger className="bg-background/80 focus:ring-primary text-sm h-9">
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
        
        {!isMobile && (
          <div className="bg-muted/30 rounded-md p-3 text-sm flex items-start gap-2">
            <div className="mt-0.5">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="font-medium">AI-Generated Research Report</span>
              <p className="text-muted-foreground text-xs mt-1">
                Creates a detailed equity research report with company analysis, financial review, valuation, and investment recommendation.
              </p>
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <Button 
            className={cn(
              "w-full flex items-center gap-2 transition-all text-sm h-10",
              !isAuthenticated ? "bg-gray-500 hover:bg-gray-600" : isGenerating ? "bg-primary/80" : "bg-primary hover:bg-primary/90"
            )}
            onClick={handleGenerateReport}
            disabled={isGenerating || !hasData}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isMobile ? "Generating..." : "Generating Report..."}</span>
              </>
            ) : !isAuthenticated ? (
              <>
                <Lock className="h-4 w-4" />
                <span>{isMobile ? "Sign In" : "Sign In to Generate Report"}</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>{isMobile ? "Generate Report" : "Generate Research Report"}</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-4 p-3 sm:p-5 rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Price Prediction
            {!isAuthenticated && remainingPredictions > 0 && (
              <div className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">
                {remainingPredictions} free
              </div>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {isPredicting && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Processing</span>
              </div>
            )}
            
            {canSavePrediction && user && onSavePrediction && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs" 
                onClick={onSavePrediction}
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>
        
        {!isMobile && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground rounded-md p-3 bg-muted/30">
            <div className="mt-0.5">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="font-medium text-foreground">AI-Powered Price Forecasting</span>
              <p className="text-muted-foreground text-xs mt-1">
                Creates a price prediction based on financial data, market trends, and advanced analysis algorithms.
              </p>
            </div>
          </div>
        )}
        
        <div className="rounded-lg border p-3 bg-muted/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground/80">Data Sources</span>
          </h4>
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
              "w-full border-primary/30 hover:bg-primary/10 flex items-center gap-2 text-sm h-10",
              isPredicting && "opacity-80"
            )}
            onClick={handlePredictPrice}
            disabled={isPredicting || !hasData}
          >
            {isPredicting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isMobile ? "Predicting..." : "Generating Prediction..."}</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                <span>{isMobile ? "Predict Price" : "Generate Price Prediction"}</span>
              </>
            )}
          </Button>
          
          {!isAuthenticated && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              {remainingPredictions > 0 
                ? `${remainingPredictions} free predictions remaining` 
                : "You've used all free predictions"}
            </p>
          )}
        </div>
      </div>

      {!hasData && (
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-start gap-2 p-3 border-l-4 border-amber-500 bg-amber-50 text-amber-800 rounded-r-md dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Cannot generate report</p>
              <p className="text-amber-700/80 text-xs mt-0.5 dark:text-amber-400/80">Financial data is not available. Please try another ticker symbol.</p>
            </div>
          </div>
        </div>
      )}
      
      {!user && (hasData) && (
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-start gap-2 p-3 border-l-4 border-blue-500 bg-blue-50 text-blue-800 rounded-r-md dark:bg-blue-950/30 dark:border-blue-700 dark:text-blue-300">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Sign in to get full access</p>
              <p className="text-blue-700/80 text-xs mt-0.5 dark:text-blue-400/80">
                Create an account or sign in to generate research reports and get unlimited price predictions.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ReportGeneratorForm;

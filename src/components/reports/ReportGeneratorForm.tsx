import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export interface ReportGeneratorFormProps {
  reportType: string;
  setReportType: (type: string) => void;
  onGenerateReport: () => void;
  onPredictPrice: () => void;
  isGenerating: boolean;
  isPredicting: boolean;
  hasData: boolean;
  onSaveReport?: () => Promise<void>;
  onSavePrediction?: () => Promise<void>;
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
  canSaveReport,
  canSavePrediction
}) => {
  const { user } = useAuth();
  const [showReportOptions, setShowReportOptions] = useState(false);

  const toggleReportOptions = () => {
    setShowReportOptions(!showReportOptions);
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-medium">Generate AI Analysis</h3>
        
        <div className="flex flex-col md:flex-row gap-3">
          <Button
            onClick={onGenerateReport}
            disabled={isGenerating || !hasData || !user}
            className="flex-1"
            variant={user ? "default" : "outline"}
          >
            {isGenerating ? "Generating..." : "Generate Research Report"}
          </Button>
          
          <Button
            onClick={onPredictPrice}
            disabled={isPredicting || !hasData}
            className="flex-1"
            variant="outline"
          >
            {isPredicting ? "Predicting..." : "Predict Stock Price"}
          </Button>
        </div>
        
        {!user && (
          <p className="text-sm text-amber-600">
            Sign in to generate full research reports
          </p>
        )}
        
        {!hasData && (
          <p className="text-sm text-red-500">
            Unable to load stock data. Please try again later.
          </p>
        )}
        
        {user && (
          <div className="mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleReportOptions}
              className="text-xs text-muted-foreground"
            >
              {showReportOptions ? "Hide Options" : "Report Options"}
            </Button>
            
            {showReportOptions && (
              <div className="mt-3 p-3 border rounded-md bg-slate-50">
                <p className="text-sm font-medium mb-2">Report Type:</p>
                <RadioGroup 
                  value={reportType} 
                  onValueChange={setReportType}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comprehensive" id="comprehensive" />
                    <Label htmlFor="comprehensive" className="text-sm">Comprehensive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="technical" id="technical" />
                    <Label htmlFor="technical" className="text-sm">Technical Analysis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fundamental" id="fundamental" />
                    <Label htmlFor="fundamental" className="text-sm">Fundamental Analysis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="growth" id="growth" />
                    <Label htmlFor="growth" className="text-sm">Growth Potential</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        )}
        
        {/* Save buttons */}
        {(canSaveReport || canSavePrediction) && (
          <div className="flex flex-col md:flex-row gap-3 mt-2 pt-3 border-t">
            {canSaveReport && onSaveReport && (
              <Button
                onClick={onSaveReport}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Save Report
              </Button>
            )}
            
            {canSavePrediction && onSavePrediction && (
              <Button
                onClick={onSavePrediction}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Save Prediction
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGeneratorForm;

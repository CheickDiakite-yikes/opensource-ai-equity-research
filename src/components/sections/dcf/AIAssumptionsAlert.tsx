
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { AIDCFSuggestion } from "@/types/ai-analysis/dcfTypes";

interface AIAssumptionsAlertProps {
  assumptions: AIDCFSuggestion | null;
  isLoading: boolean;
  hasError: boolean;
  usingMockData?: boolean;
}

const AIAssumptionsAlert: React.FC<AIAssumptionsAlertProps> = ({ 
  assumptions, 
  isLoading, 
  hasError,
  usingMockData = false
}) => {
  if (isLoading) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle>Generating assumptions</AlertTitle>
        <AlertDescription>
          We're using AI to analyze company fundamentals and generate DCF assumptions...
        </AlertDescription>
      </Alert>
    );
  }
  
  if (hasError || !assumptions || usingMockData) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle>Using estimated DCF model</AlertTitle>
        <AlertDescription>
          We're using standard financial assumptions to generate a DCF model. 
          {hasError && " This is due to an error in retrieving AI-powered assumptions."}
          {usingMockData && " The calculations are based on reasonable estimates rather than precise company-specific data."}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="bg-green-50 border-green-200">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <AlertTitle>AI-Generated Assumptions</AlertTitle>
      <AlertDescription>
        This DCF model uses AI-generated assumptions based on {assumptions.company}'s financial profile 
        and market conditions as of {new Date(assumptions.timestamp).toLocaleDateString()}.
      </AlertDescription>
    </Alert>
  );
};

export default AIAssumptionsAlert;

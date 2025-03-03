
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, RotateCw } from "lucide-react";
import { AIDCFSuggestion } from "@/types/aiAnalysisTypes";

interface AIAssumptionsAlertProps {
  assumptions: AIDCFSuggestion;
  onRefresh: () => void;
  isLoading: boolean;
  isCalculating: boolean;
}

const AIAssumptionsAlert: React.FC<AIAssumptionsAlertProps> = ({ 
  assumptions, 
  onRefresh,
  isLoading,
  isCalculating
}) => {
  if (!assumptions) return null;
  
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <InfoIcon className="h-4 w-4 text-blue-500" />
      <AlertTitle className="font-medium text-blue-700">AI-Generated DCF Assumptions</AlertTitle>
      <AlertDescription className="text-sm text-blue-600">
        <p className="mb-2">{assumptions.explanation}</p>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 text-blue-600 border-blue-300"
            onClick={onRefresh}
            disabled={isLoading || isCalculating}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Refresh Analysis
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AIAssumptionsAlert;


import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DCFErrorDisplayProps {
  errors: string[];
  onRetry?: () => void;
}

const DCFErrorDisplay: React.FC<DCFErrorDisplayProps> = ({ errors, onRetry }) => {
  if (!errors || errors.length === 0) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">DCF Calculation Error</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-4">
          <div>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {errors.map((error, i) => (
                <li key={i} className="text-sm">{error}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white/20 rounded-md p-3 text-sm">
            <div className="flex items-start">
              <Info className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <span>
                Using estimated values for the DCF calculation. The displayed results are based on
                reasonable assumptions rather than real-time data.
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <span className="text-xs opacity-80 text-center sm:text-left">
              If the error persists, try selecting a different DCF calculation method or check again later.
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DCFErrorDisplay;

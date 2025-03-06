
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DCFErrorDisplayProps {
  errors: string[];
  onRetry?: () => void;
}

const DCFErrorDisplay: React.FC<DCFErrorDisplayProps> = ({ errors, onRetry }) => {
  if (!errors || errors.length === 0) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>DCF Calculation Notice</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
        <p className="mt-2">Using estimated values for the DCF calculation. The displayed results are based on reasonable assumptions rather than real-time data.</p>
        
        <div className="mt-3 flex space-x-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <p className="text-xs mt-1 flex items-center">You can also try selecting a different DCF calculation method.</p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DCFErrorDisplay;

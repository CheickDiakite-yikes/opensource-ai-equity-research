
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface DCFErrorDisplayProps {
  errors: string[];
  onCustomDCFClick?: () => void;
}

const DCFErrorDisplay: React.FC<DCFErrorDisplayProps> = ({ 
  errors,
  onCustomDCFClick 
}) => {
  if (errors.length === 0) return null;

  const has404Error = errors.some(error => error.includes("404") || error.includes("not found"));
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error Calculating DCF</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
        
        {has404Error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="font-medium">API Endpoint Not Found (404)</p>
            <p className="mt-1 text-sm">The DCF calculation service is unavailable. This could be because:</p>
            <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
              <li>The Edge Function for DCF calculations has not been deployed</li>
              <li>The API route is misconfigured</li>
              <li>There is a network connectivity issue</li>
            </ul>
          </div>
        )}
        
        <p className="mt-3">Using estimated values for the DCF calculation. The displayed results are based on reasonable assumptions rather than real-time data.</p>
        
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm">Note: If this error persists, try using the Custom DCF tab to create a DCF model with your own parameters.</p>
          
          {onCustomDCFClick && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCustomDCFClick}
              className="ml-2 flex items-center"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Try Custom DCF
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DCFErrorDisplay;

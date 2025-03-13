
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, XCircle, Copy, ChevronDown, ChevronUp } from "lucide-react";

interface DebugErrorDisplayProps {
  title: string;
  error: Error | string;
  context?: Record<string, any>;
  onRetry?: () => void;
  className?: string;
}

/**
 * Enhanced error display component with debugging details
 */
const DebugErrorDisplay: React.FC<DebugErrorDisplayProps> = ({
  title,
  error,
  context,
  onRetry,
  className = ""
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <XCircle className="h-6 w-6 text-red-600 mr-2" />
          <h3 className="text-lg font-medium text-red-600">{title}</h3>
        </div>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            Try Again
          </Button>
        )}
      </div>
      
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
      
      <Button 
        variant="ghost" 
        className="w-full flex justify-between items-center mb-2"
        onClick={() => setShowDetails(!showDetails)}
      >
        <span>Debug Details</span>
        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      {showDetails && (
        <div className="space-y-4">
          {errorStack && (
            <div className="relative">
              <div className="absolute right-2 top-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => copyToClipboard(errorStack)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-md text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
                {errorStack}
              </div>
            </div>
          )}
          
          {context && Object.keys(context).length > 0 && (
            <div className="relative">
              <div className="absolute right-2 top-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => copyToClipboard(JSON.stringify(context, null, 2))}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <h4 className="text-sm font-medium mb-1">Context Data:</h4>
              <div className="bg-muted p-4 rounded-md text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
                {JSON.stringify(context, null, 2)}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default DebugErrorDisplay;

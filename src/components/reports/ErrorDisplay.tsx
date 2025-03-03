
import React from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  // Check if it's an API error
  const isApiError = error.includes("API") || 
                     error.includes("2xx") || 
                     error.includes("fetch") ||
                     error.includes("Failed to");
  
  return (
    <Card className="p-6">
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
        <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        
        {isApiError && (
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md mb-4 mx-auto max-w-lg text-left">
            <p className="font-medium mb-2">Possible solutions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your internet connection</li>
              <li>The third-party data provider might be experiencing temporary issues</li>
              <li>The API might have rate limits or data restrictions for this symbol</li>
              <li>Try searching for a different stock symbol</li>
            </ul>
          </div>
        )}
        
        {onRetry && (
          <Button onClick={onRetry} className="mt-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ErrorDisplay;


import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  errorMessage: string | null;
  onRetry?: () => void;
}

const ErrorDisplay = ({ errorMessage, onRetry }: ErrorDisplayProps) => {
  const fullError = errorMessage || "Unable to load data for this symbol";
  
  // Check if it's an API error
  const isApiError = fullError.includes("API") || 
                     fullError.includes("2xx") || 
                     fullError.includes("fetch") ||
                     fullError.includes("Failed to");
  
  return (
    <Card className="p-6">
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
        <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
        <p className="text-muted-foreground mb-4">{fullError}</p>
        
        {isApiError && (
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md mb-4 mx-auto max-w-lg text-left">
            <p className="font-medium mb-2">Possible solutions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your internet connection</li>
              <li>The API keys are set correctly in Supabase, this might be a temporary service issue</li>
              <li>The third-party API may be unavailable or have rate limits</li>
            </ul>
          </div>
        )}
        
        {onRetry && (
          <Button onClick={onRetry} className="mt-2">
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ErrorDisplay;

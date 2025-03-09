
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  symbol: string;
  onRetry: () => void;
  isRetrying: boolean;
  message?: string; // Make message optional
  dataSource?: string; // Indicate which data source failed
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  symbol, 
  onRetry, 
  isRetrying, 
  message,
  dataSource = "primary"
}) => {
  return (
    <Card className="p-6">
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>
        <h3 className="text-xl font-medium text-red-600 mb-4">
          {dataSource === "all" 
            ? "No Financial Data Available" 
            : `${dataSource === "fallback" ? "Alternative" : "Primary"} Data Source Unavailable`}
        </h3>
        <p className="text-muted-foreground mb-6">
          {message || `We couldn't load the financial data required for analysis. This may be due to:`}
        </p>
        <ul className="text-sm text-muted-foreground bg-muted p-4 rounded-md mb-6 mx-auto max-w-lg text-left">
          <li className="mb-2">• Data provider API limitations or rate limiting</li>
          <li className="mb-2">• The selected company ({symbol}) may not have public financial data</li>
          <li className="mb-2">• Temporary connectivity issues with our data sources</li>
          <li>• The financial data for this company may be in a different format</li>
        </ul>
        <Button 
          onClick={onRetry} 
          className="mt-2 flex items-center gap-2"
          disabled={isRetrying}
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
        </Button>
      </div>
    </Card>
  );
};

export default ErrorState;

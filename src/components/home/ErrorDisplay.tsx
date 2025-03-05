
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
      <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400 mb-2" />
      <p className="text-sm text-red-600 dark:text-red-300 mb-3">{message}</p>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="flex items-center gap-1.5 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  );
};

export default ErrorDisplay;

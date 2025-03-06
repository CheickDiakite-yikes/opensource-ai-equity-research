
import React from "react";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DCFLoadingIndicatorProps {
  isLoading: boolean;
  isLoadingAssumptions: boolean;
}

const DCFLoadingIndicator: React.FC<DCFLoadingIndicatorProps> = ({ 
  isLoading,
  isLoadingAssumptions
}) => {
  if (!isLoading && !isLoadingAssumptions) return null;
  
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
        <h3 className="text-lg font-medium">
          {isLoadingAssumptions 
            ? "Generating AI Assumptions..." 
            : "Calculating DCF Valuation..."}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Skeleton className="h-8 w-40 mb-4" />
          <Skeleton className="h-16 w-full mb-4" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        
        <div>
          <Skeleton className="h-8 w-40 mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      
      <div>
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
      
      <p className="text-xs text-muted-foreground">
        {isLoadingAssumptions 
          ? "Financial data is being analyzed to recommend optimal DCF assumptions." 
          : "A complex DCF model is being calculated using financial data and the specified assumptions."}
      </p>
    </Card>
  );
};

export default DCFLoadingIndicator;

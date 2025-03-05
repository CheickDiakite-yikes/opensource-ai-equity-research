
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface DCFLoadingIndicatorProps {
  isLoading: boolean;
  isLoadingAssumptions: boolean;
}

const DCFLoadingIndicator: React.FC<DCFLoadingIndicatorProps> = ({ 
  isLoading,
  isLoadingAssumptions
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-md border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">DCF Valuation</h3>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </div>
        </div>
        
        <div className="rounded-md border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Sensitivity Analysis</h3>
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
      
      <div className="rounded-md border p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Projected Cash Flows</h3>
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  );
};

export default DCFLoadingIndicator;

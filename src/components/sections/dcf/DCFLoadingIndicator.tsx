
import React from "react";
import { Loader2 } from "lucide-react";

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
    <div className="flex justify-center items-center py-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">
        {isLoadingAssumptions ? "Loading AI-powered DCF assumptions..." : "Calculating DCF valuation..."}
      </span>
    </div>
  );
};

export default DCFLoadingIndicator;

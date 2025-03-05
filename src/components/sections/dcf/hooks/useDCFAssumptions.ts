
import { useState, useCallback } from "react";
import { useAIDCFAssumptions } from "@/hooks/dcf/useAIDCFAssumptions";
import { toast } from "@/components/ui/use-toast";
import { AIDCFSuggestion } from "@/types/ai-analysis/dcfTypes";

export const useDCFAssumptions = (symbol: string) => {
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  
  const { 
    assumptions, 
    isLoading: isLoadingAssumptions, 
    error: assumptionsError, 
    refreshAssumptions 
  } = useAIDCFAssumptions(symbol);

  // Handle refreshing assumptions
  const handleRefreshAssumptions = useCallback(async () => {
    try {
      toast({
        title: "Refreshing",
        description: "Generating new AI-powered DCF assumptions...",
      });
      
      await refreshAssumptions();
      setHasAttemptedFetch(false);
      
      toast({
        title: "Refreshed",
        description: "AI-powered DCF assumptions have been updated.",
      });

      return { success: true };
    } catch (err) {
      console.error("Error refreshing assumptions:", err);
      
      toast({
        title: "Error",
        description: "Failed to refresh DCF assumptions. Using estimated values instead.",
        variant: "destructive",
      });
      
      return { success: false, error: err };
    }
  }, [refreshAssumptions]);

  return {
    assumptions,
    isLoadingAssumptions,
    assumptionsError,
    hasAttemptedFetch,
    setHasAttemptedFetch,
    handleRefreshAssumptions
  };
};

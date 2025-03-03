
import { useState, useEffect } from "react";
import { fetchAIDCFAssumptions } from "@/services/api/analysisService";
import { AIDCFSuggestion } from "@/types/aiAnalysisTypes";
import { toast } from "@/components/ui/use-toast";

export const useAIDCFAssumptions = (symbol: string) => {
  const [assumptions, setAssumptions] = useState<AIDCFSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssumptions = async (refresh = false) => {
    if (!symbol) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchAIDCFAssumptions(symbol, refresh);
      
      if (data) {
        setAssumptions(data);
        console.log("AI DCF assumptions loaded:", data);
      } else {
        setError("Failed to load AI DCF assumptions");
        if (!refresh) {
          // Only show toast if this is not a refresh attempt
          toast({
            title: "Warning",
            description: `Could not load AI-powered DCF assumptions for ${symbol}.`,
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error("Error in useAIDCFAssumptions:", err);
      setError(err instanceof Error ? err.message : String(err));
      
      if (!refresh) {
        // Only show toast if this is not a refresh attempt
        toast({
          title: "Error",
          description: `Failed to load AI DCF assumptions: ${err instanceof Error ? err.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch assumptions when symbol changes
  useEffect(() => {
    if (symbol) {
      fetchAssumptions();
    }
  }, [symbol]);

  const refreshAssumptions = () => {
    return fetchAssumptions(true);
  };

  return {
    assumptions,
    isLoading,
    error,
    refreshAssumptions
  };
};

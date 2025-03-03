
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
        // Ensure all required fields are present and have proper values
        const validatedData = validateAssumptions(data);
        setAssumptions(validatedData);
        console.log("AI DCF assumptions loaded:", validatedData);
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

  // Validate the assumptions data structure and provide defaults for missing values
  const validateAssumptions = (data: AIDCFSuggestion): AIDCFSuggestion => {
    // Default assumptions to use if values are missing or invalid
    const defaultAssumptions = {
      revenueGrowthPct: 0.1094,
      ebitdaMarginPct: 0.3127,
      capitalExpenditurePct: 0.0306,
      taxRatePct: 0.2409,
      depreciationAndAmortizationPct: 0.0345,
      cashAndShortTermInvestmentsPct: 0.2344,
      receivablesPct: 0.1533,
      inventoriesPct: 0.0155,
      payablesPct: 0.1614,
      ebitPct: 0.2781,
      operatingCashFlowPct: 0.2886,
      sellingGeneralAndAdministrativeExpensesPct: 0.0662,
      longTermGrowthRatePct: 0.04,
      costOfEquityPct: 0.0951,
      costOfDebtPct: 0.0364,
      marketRiskPremiumPct: 0.0472,
      riskFreeRatePct: 0.0364,
      beta: 1.244,
    };

    // Ensure assumptions object exists
    if (!data.assumptions) {
      data.assumptions = { ...defaultAssumptions };
    } else {
      // Fill in any missing values with defaults
      Object.keys(defaultAssumptions).forEach(key => {
        if (data.assumptions[key] === undefined || 
            data.assumptions[key] === null || 
            isNaN(data.assumptions[key])) {
          data.assumptions[key] = defaultAssumptions[key];
        }
        
        // Convert any percentages (e.g., 10.5) to decimals (0.105) if they appear to be in percentage form
        // We consider any value > 1 for growth/rate parameters to be in percentage form
        if (['revenueGrowthPct', 'ebitdaMarginPct', 'capitalExpenditurePct', 'taxRatePct',
             'depreciationAndAmortizationPct', 'longTermGrowthRatePct', 'costOfEquityPct',
             'costOfDebtPct', 'marketRiskPremiumPct', 'riskFreeRatePct'].includes(key)) {
          if (data.assumptions[key] > 1) {
            data.assumptions[key] = data.assumptions[key] / 100;
            console.log(`Converted ${key} from percentage to decimal: ${data.assumptions[key]}`);
          }
        }
      });
    }

    // Ensure other required fields are present
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    
    if (!data.expiresAt) {
      // Set expiration to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      data.expiresAt = expiresAt.toISOString();
    }
    
    if (!data.explanation) {
      data.explanation = "AI-generated DCF assumptions based on historical performance and industry benchmarks.";
    }

    return data;
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

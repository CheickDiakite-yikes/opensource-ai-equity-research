import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { calculateCustomDCF } from "@/services/api";
import { 
  CustomDCFResult, 
  DCFInputs,
  YearlyDCFData
} from "@/types/ai-analysis/dcfTypes";

export function useDCFCalculation(symbol: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [dcfResult, setDcfResult] = useState<CustomDCFResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateDCF = useCallback(async (
    customInputs?: Partial<DCFInputs>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await calculateCustomDCF(symbol, customInputs);

      if (result && result.status === 200) {
        const data = await result.json();
        
        // Add null check before accessing properties
        if (data && typeof data === 'object') {
          const dcfResult: CustomDCFResult = {
            equityValuePerShare: data.equityValuePerShare || 0,
            enterpriseValue: data.enterpriseValue || 0,
            equityValue: data.equityValue || 0,
            totalDebt: data.totalDebt || 0,
            cashAndCashEquivalents: data.cashAndCashEquivalents || 0,
            wacc: data.wacc || 0.09,
            taxRate: data.taxRate || 0.21,
            revenuePercentage: data.revenuePercentage || 8.5,
            longTermGrowthRate: data.longTermGrowthRate || 0.03,
            yearlyProjections: data.yearlyProjections || []
          };
          
          setDcfResult(dcfResult);
          toast({
            title: "DCF Calculation Complete",
            description: `Intrinsic value per share: $${dcfResult.equityValuePerShare?.toFixed(2)}`,
          });
        } else {
          throw new Error("Invalid response format from DCF calculation");
        }
      } else {
        throw new Error(`DCF calculation failed with status: ${result?.status || 'unknown'}`);
      }
    } catch (error: any) {
      console.error("DCF calculation error:", error);
      setError(error.message || "Failed to calculate DCF");
      toast({
        title: "DCF Calculation Error",
        description: error.message || "Failed to calculate DCF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [symbol, setIsLoading, setDcfResult, setError]);

  return {
    isLoading,
    dcfResult,
    error,
    calculateDCF,
  };
}

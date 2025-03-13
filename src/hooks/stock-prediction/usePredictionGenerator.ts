
import { useState } from "react";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { generateStockPrediction, savePricePrediction } from "@/services/api/analysis/researchService";
import { useToast } from "@/hooks/use-toast";

export const usePredictionGenerator = (symbol: string) => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const { toast } = useToast();

  const handlePredictPrice = async (
    symbol: string,
    companyName: string, 
    profile: any, 
    financials: any,
    news: any[] = []  // Made news optional with default empty array
  ) => {
    if (!profile || !financials) {
      toast({
        title: "Missing data",
        description: "Cannot generate prediction without company data.",
        variant: "destructive",
      });
      return null;
    }

    setIsPredicting(true);
    try {
      const generatedPrediction = await generateStockPrediction(
        symbol,
        profile,
        financials,
        news
      );
      
      setPrediction(generatedPrediction);
      
      // Save the generated prediction to the database
      if (generatedPrediction) {
        await savePricePrediction(
          symbol, 
          companyName || symbol, 
          generatedPrediction
        );
        
        toast({
          title: "Prediction saved",
          description: "Your price prediction has been saved and can be accessed later.",
        });
      }
      
      return generatedPrediction;
    } catch (error) {
      console.error("Error generating prediction:", error);
      toast({
        title: "Error",
        description: "Failed to generate the price prediction. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsPredicting(false);
    }
  };

  return {
    isPredicting,
    prediction,
    handlePredictPrice
  };
};

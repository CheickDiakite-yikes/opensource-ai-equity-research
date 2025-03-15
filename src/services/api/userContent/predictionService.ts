
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { Json } from "@/integrations/supabase/types";
import { getUserId, manageItemLimit } from "./baseService";

/**
 * Save a price prediction for the current user
 */
export const savePricePrediction = async (
  symbol: string,
  companyName: string,
  predictionData: StockPrediction
): Promise<string | null> => {
  try {
    console.log("Starting savePricePrediction for:", symbol);
    const userId = await getUserId();
    if (!userId) {
      console.error("No user ID found when saving prediction");
      toast.error("You must be signed in to save predictions");
      return null;
    }
    
    console.log("User ID:", userId);

    // First, count existing predictions
    const { count, error: countError } = await supabase
      .from("user_price_predictions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Error counting predictions:", countError);
      toast.error("Failed to save prediction");
      return null;
    }

    console.log("Current prediction count:", count);

    // Manage item limit
    const limitManaged = await manageItemLimit("user_price_predictions", userId, count);
    if (!limitManaged) {
      console.error("Failed to manage item limit");
      return null;
    }

    // Validate prediction data before saving
    // Add safety check for unrealistic prediction values
    const isValid = validatePredictionData(predictionData);
    if (!isValid) {
      console.error("Invalid prediction data detected:", 
        JSON.stringify({
          symbol: predictionData.symbol,
          current: predictionData.currentPrice,
          oneMonth: predictionData.predictedPrice.oneMonth,
          oneYear: predictionData.predictedPrice.oneYear
        })
      );
      toast.error("Failed to save prediction: Invalid prediction values");
      return null;
    }

    // Now, insert the new prediction
    console.log("Inserting prediction into database");
    console.log("Prediction data sample:", JSON.stringify(predictionData).substring(0, 200) + "...");
    
    // Changed: Removed the ON CONFLICT clause since there's no unique constraint defined
    const { data, error } = await supabase
      .from("user_price_predictions")
      .insert({
        user_id: userId,
        symbol,
        company_name: companyName,
        prediction_data: predictionData as unknown as Json,
      })
      .select("id");

    if (error) {
      console.error("Error saving prediction:", error);
      toast.error("Failed to save prediction: " + error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.error("No data returned after saving prediction");
      toast.error("Failed to save prediction - no data returned");
      return null;
    }

    console.log("Prediction saved successfully. ID:", data[0].id);
    toast.success("Price prediction saved successfully");
    return data[0].id;
  } catch (error) {
    console.error("Error in savePricePrediction:", error);
    toast.error("An unexpected error occurred");
    return null;
  }
};

/**
 * Validate prediction data to ensure it has reasonable values
 */
function validatePredictionData(prediction: StockPrediction): boolean {
  if (!prediction || !prediction.predictedPrice) return false;
  
  const { currentPrice, predictedPrice } = prediction;
  
  // Basic validation
  if (typeof currentPrice !== 'number' || currentPrice <= 0) return false;
  
  // Check prediction values - no extreme values (more than 5x current price)
  const maxPrice = currentPrice * 5;
  const timeframes = ['oneMonth', 'threeMonths', 'sixMonths', 'oneYear'] as const;
  
  for (const timeframe of timeframes) {
    const price = predictedPrice[timeframe];
    if (
      typeof price !== 'number' || 
      !isFinite(price) || 
      price <= 0 || 
      price > maxPrice
    ) {
      console.error(`Invalid ${timeframe} price: ${price} (current: ${currentPrice})`);
      return false;
    }
  }
  
  return true;
}

/**
 * Get all saved price predictions for the current user
 */
export const getUserPricePredictions = async () => {
  try {
    console.log("Getting user price predictions");
    const userId = await getUserId();
    if (!userId) {
      console.log("No user ID found when getting predictions");
      return [];
    }

    console.log("Fetching predictions for user:", userId);
    const { data, error } = await supabase
      .from("user_price_predictions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user predictions:", error);
      toast.error("Failed to load saved predictions: " + error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("No predictions found for user");
      return [];
    }

    console.log(`Found ${data.length} predictions for user`);
    return data || [];
  } catch (error) {
    console.error("Error in getUserPricePredictions:", error);
    toast.error("An unexpected error occurred");
    return [];
  }
};

/**
 * Delete a price prediction by ID
 */
export const deletePricePrediction = async (predictionId: string): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.error("No user ID found when deleting prediction");
      toast.error("You must be signed in to delete predictions");
      return false;
    }

    const { error } = await supabase
      .from("user_price_predictions")
      .delete()
      .eq("id", predictionId)
      .eq("user_id", userId); // Important for RLS - explicitly filter by user_id

    if (error) {
      console.error("Error deleting prediction:", error);
      toast.error("Failed to delete prediction");
      return false;
    }

    toast.success("Prediction deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deletePricePrediction:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
};

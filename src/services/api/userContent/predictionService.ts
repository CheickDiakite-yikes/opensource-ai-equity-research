
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
    // Since RLS is disabled, we'll still try to get a user ID but won't fail if it's not available
    const userId = await getUserId() || 'dev-user';
    console.log("User ID:", userId);

    // In development mode with RLS disabled, we don't need to count existing predictions
    console.log("Inserting prediction into database");
    console.log("Prediction data sample:", JSON.stringify(predictionData).substring(0, 200) + "...");
    
    // Insert the new prediction (with RLS disabled, we don't need to worry about user_id matching)
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
 * Get all saved price predictions for the current user
 */
export const getUserPricePredictions = async () => {
  try {
    console.log("Getting user price predictions");
    // With RLS disabled, we can fetch all predictions without filtering by user_id
    // But we'll still try to get the user ID for logging purposes
    const userId = await getUserId() || 'dev-user';
    console.log("Fetching predictions (with RLS disabled)");
    
    // Fetch all predictions without strict user filtering
    const { data, error } = await supabase
      .from("user_price_predictions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching predictions:", error);
      toast.error("Failed to load saved predictions: " + error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("No predictions found");
      return [];
    }

    console.log(`Found ${data.length} predictions`);
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
    console.log("Deleting prediction:", predictionId);
    // With RLS disabled, we can delete any prediction without checking user_id
    const { error } = await supabase
      .from("user_price_predictions")
      .delete()
      .eq("id", predictionId);

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

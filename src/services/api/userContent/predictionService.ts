
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

    // First, check if this user already has a prediction for this symbol
    const { data: existingPredictions, error: checkError } = await supabase
      .from("user_price_predictions")
      .select("id")
      .eq("user_id", userId)
      .eq("symbol", symbol);
      
    if (checkError) {
      console.error("Error checking existing predictions:", checkError);
      toast.error("Failed to check existing predictions");
      return null;
    }
    
    const existingPredictionId = existingPredictions && existingPredictions.length > 0 
      ? existingPredictions[0].id 
      : null;
    
    console.log("Existing prediction ID:", existingPredictionId);
    
    // If we're not updating an existing prediction, check the total count and manage limit
    if (!existingPredictionId) {
      // Get current count of user's predictions
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

      // Manage item limit - delete oldest if over limit
      if (count && count >= 10) {
        const limitManaged = await manageItemLimit("user_price_predictions", userId, count);
        if (!limitManaged) {
          console.error("Failed to manage item limit");
          return null;
        }
      }
    }

    // Prepare prediction data
    const predictionInfo = {
      user_id: userId,
      symbol,
      company_name: companyName,
      prediction_data: predictionData as unknown as Json,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Insert or update based on whether prediction exists
    if (existingPredictionId) {
      console.log("Updating existing prediction with ID:", existingPredictionId);
      
      const { error } = await supabase
        .from("user_price_predictions")
        .update(predictionInfo)
        .eq("id", existingPredictionId);
        
      if (error) {
        console.error("Error updating prediction:", error);
        toast.error("Failed to update prediction: " + error.message);
        return null;
      }
      
      console.log("Successfully updated prediction");
      toast.success("Price prediction updated successfully");
      return existingPredictionId;
    } else {
      console.log("Inserting new prediction");
      
      const { data, error } = await supabase
        .from("user_price_predictions")
        .insert(predictionInfo)
        .select();
        
      if (error) {
        console.error("Error saving prediction:", error);
        toast.error("Failed to save prediction: " + error.message);
        return null;
      }
      
      const newPredictionId = data && data.length > 0 ? data[0].id : null;
      
      if (!newPredictionId) {
        console.error("No prediction ID returned after save operation");
        toast.error("Failed to save prediction - no ID returned");
        return null;
      }
      
      console.log("Successfully inserted prediction with ID:", newPredictionId);
      toast.success("Price prediction saved successfully");
      return newPredictionId;
    }
  } catch (error) {
    console.error("Error in savePricePrediction:", error);
    toast.error("An unexpected error occurred while saving prediction");
    return null;
  }
};

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
    console.log("Deleting prediction with ID:", predictionId);
    const { error } = await supabase
      .from("user_price_predictions")
      .delete()
      .eq("id", predictionId);

    if (error) {
      console.error("Error deleting prediction:", error);
      toast.error("Failed to delete prediction: " + error.message);
      return false;
    }

    console.log("Prediction deleted successfully");
    toast.success("Prediction deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deletePricePrediction:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
};

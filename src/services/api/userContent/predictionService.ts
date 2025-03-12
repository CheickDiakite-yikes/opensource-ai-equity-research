
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

    // Prepare expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    // Check if a prediction with this symbol already exists for this user
    const { data: existingPredictions, error: existingError } = await supabase
      .from("user_price_predictions")
      .select("id")
      .eq("user_id", userId)
      .eq("symbol", symbol);
      
    if (existingError) {
      console.error("Error checking for existing predictions:", existingError);
      toast.error("Failed to save prediction");
      return null;
    }
    
    let predictionId: string | null = null;
    
    if (existingPredictions && existingPredictions.length > 0) {
      // Update existing prediction
      console.log("Updating existing prediction for symbol:", symbol);
      const { data, error } = await supabase
        .from("user_price_predictions")
        .update({
          company_name: companyName,
          prediction_data: predictionData as unknown as Json,
          expires_at: expiresAt.toISOString()
        })
        .eq("id", existingPredictions[0].id)
        .select("id")
        .single();
        
      if (error) {
        console.error("Error updating prediction:", error);
        toast.error("Failed to update prediction: " + error.message);
        return null;
      }
      
      predictionId = data?.id || null;
    } else {
      // Insert new prediction
      console.log("Inserting new prediction for symbol:", symbol);
      const { data, error } = await supabase
        .from("user_price_predictions")
        .insert({
          user_id: userId,
          symbol,
          company_name: companyName,
          prediction_data: predictionData as unknown as Json,
          expires_at: expiresAt.toISOString()
        })
        .select("id")
        .single();
        
      if (error) {
        console.error("Error saving prediction:", error);
        toast.error("Failed to save prediction: " + error.message);
        return null;
      }
      
      predictionId = data?.id || null;
    }

    if (!predictionId) {
      console.error("No prediction ID returned after saving");
      toast.error("Failed to save prediction - no ID returned");
      return null;
    }

    console.log("Prediction saved successfully. ID:", predictionId);
    toast.success("Price prediction saved successfully");
    return predictionId;
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

    toast.success("Prediction deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deletePricePrediction:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
};

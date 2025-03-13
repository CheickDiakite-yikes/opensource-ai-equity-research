
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { Json } from "@/integrations/supabase/types";
import { getUserId, countUserItems, deleteOldestItems } from "./baseService";

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
    
    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.error("No active session found");
      toast.error("You must be signed in to save predictions");
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    if (!userId) {
      console.error("No user ID found in active session");
      toast.error("Authentication error: Cannot identify user");
      return null;
    }
    
    console.log("Found user ID:", userId);

    // Count existing predictions
    const currentCount = await countUserItems("user_price_predictions", userId);
    console.log("Current prediction count:", currentCount);

    // Delete oldest predictions if over limit
    if (currentCount >= 10) {
      const deleted = await deleteOldestItems("user_price_predictions", userId, currentCount);
      if (!deleted) {
        console.error("Failed to delete oldest predictions");
        toast.error("Failed to save prediction - couldn't manage prediction limit");
        return null;
      }
    }

    // Now, insert the new prediction
    console.log("Inserting prediction for user:", userId);
    
    const { data, error } = await supabase
      .from("user_price_predictions")
      .insert({
        user_id: userId,
        symbol,
        company_name: companyName,
        prediction_data: predictionData as unknown as Json
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
    
    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.log("No active session found");
      return [];
    }
    
    const userId = sessionData.session.user.id;
    
    if (!userId) {
      console.log("No user ID found in active session");
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
    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.error("No active session found");
      toast.error("Authentication error. Please sign in again.");
      return false;
    }
    
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

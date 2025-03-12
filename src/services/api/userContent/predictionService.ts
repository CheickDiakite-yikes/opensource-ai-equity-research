
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

    // First, check if prediction already exists for this symbol
    const { data: existingPrediction, error: checkError } = await supabase
      .from("user_price_predictions")
      .select("id")
      .eq("user_id", userId)
      .eq("symbol", symbol)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing prediction:", checkError);
      toast.error("Failed to save prediction");
      return null;
    }

    // Set expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const expiresAtString = expiresAt.toISOString();

    if (existingPrediction) {
      // Update existing prediction
      console.log("Updating existing prediction for:", symbol);
      const { data, error } = await supabase
        .from("user_price_predictions")
        .update({
          company_name: companyName,
          prediction_data: predictionData as unknown as Json,
          expires_at: expiresAtString
        })
        .eq("id", existingPrediction.id)
        .select("id");

      if (error) {
        console.error("Error updating prediction:", error);
        toast.error("Failed to update prediction: " + error.message);
        return null;
      }

      console.log("Prediction updated successfully. ID:", existingPrediction.id);
      toast.success("Price prediction updated successfully");
      return existingPrediction.id;
    } else {
      // If no existing prediction, count and manage limits
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

      // Insert new prediction - DO NOT USE ON CONFLICT
      console.log("Inserting new prediction into database");
      console.log("Prediction data sample:", JSON.stringify(predictionData).substring(0, 200) + "...");
      
      const { data, error } = await supabase
        .from("user_price_predictions")
        .insert({
          user_id: userId,
          symbol,
          company_name: companyName,
          prediction_data: predictionData as unknown as Json,
          expires_at: expiresAtString
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
    }
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
    console.log(`Deleting prediction with ID: ${predictionId}`);
    
    // Use .eq for deletion without any ON CONFLICT clause
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

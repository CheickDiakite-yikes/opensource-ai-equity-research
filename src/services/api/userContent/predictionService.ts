
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { Json } from "@/integrations/supabase/types";
import { getUserId, manageItemLimit, UserContentError } from "./baseService";

/**
 * Save a price prediction for the current user
 */
export const savePricePrediction = async (
  symbol: string,
  companyName: string,
  predictionData: StockPrediction
): Promise<string | null> => {
  try {
    console.log("=== Starting savePricePrediction ===");
    console.log("Symbol:", symbol);
    console.log("Company:", companyName);
    
    const userId = await getUserId();
    if (!userId) {
      toast.error("You must be signed in to save predictions");
      return null;
    }
    
    console.log("User ID:", userId);

    // Count existing predictions
    const { count, error: countError } = await supabase
      .from("user_price_predictions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      throw new UserContentError("Error counting predictions", "savePricePrediction", countError);
    }

    console.log("Current prediction count:", count);

    // Manage item limit
    const limitManaged = await manageItemLimit("user_price_predictions", userId, count);
    if (!limitManaged) {
      throw new UserContentError("Failed to manage item limit", "savePricePrediction");
    }

    // Insert the new prediction using a simple insert without ON CONFLICT
    console.log("Inserting prediction into database");
    
    // Debug log the full object being inserted
    const insertObject = {
      user_id: userId,
      symbol,
      company_name: companyName,
      prediction_data: predictionData as unknown as Json,
    };
    console.log("Insert object:", JSON.stringify(insertObject));
    
    // Simple insert without ON CONFLICT
    const { data, error } = await supabase
      .from("user_price_predictions")
      .insert(insertObject)
      .select("id");

    if (error) {
      throw new UserContentError("Error saving prediction", "savePricePrediction", error);
    }

    if (!data || data.length === 0) {
      throw new UserContentError("No data returned after saving prediction", "savePricePrediction");
    }

    console.log("Prediction saved successfully. ID:", data[0].id);
    toast.success("Price prediction saved successfully");
    return data[0].id;
  } catch (error) {
    // Handle UserContentError properly
    if (error instanceof UserContentError) {
      console.error(`${error.source}: ${error.message}`, error.details);
      toast.error(error.message);
      return null;
    }
    
    // Otherwise create a new error
    console.error("Unexpected error in savePricePrediction:", error);
    toast.error("An unexpected error occurred while saving prediction");
    return null;
  }
};

/**
 * Get all saved price predictions for the current user
 */
export const getUserPricePredictions = async () => {
  try {
    console.log("=== Getting user price predictions ===");
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
      throw new UserContentError("Error fetching user predictions", "getUserPricePredictions", error);
    }

    if (!data || data.length === 0) {
      console.log("No predictions found for user");
      return [];
    }

    console.log(`Found ${data.length} predictions for user`);
    // Log sample data structure for debugging
    if (data.length > 0) {
      console.log("Sample prediction data structure:", {
        id: data[0].id,
        symbol: data[0].symbol,
        created_at: data[0].created_at,
        data_keys: data[0].prediction_data ? Object.keys(data[0].prediction_data) : 'no data'
      });
    }
    
    return data || [];
  } catch (error) {
    if (error instanceof UserContentError) {
      console.error(`${error.source}: ${error.message}`, error.details);
      toast.error(error.message);
      return [];
    }
    
    console.error("Unexpected error in getUserPricePredictions:", error);
    toast.error("An unexpected error occurred while fetching predictions");
    return [];
  }
};

/**
 * Delete a price prediction by ID
 */
export const deletePricePrediction = async (predictionId: string): Promise<boolean> => {
  try {
    console.log("=== Deleting prediction ===");
    console.log("Prediction ID:", predictionId);
    
    const { error } = await supabase
      .from("user_price_predictions")
      .delete()
      .eq("id", predictionId);

    if (error) {
      throw new UserContentError("Error deleting prediction", "deletePricePrediction", error);
    }

    toast.success("Prediction deleted successfully");
    return true;
  } catch (error) {
    if (error instanceof UserContentError) {
      console.error(`${error.source}: ${error.message}`, error.details);
      toast.error(error.message);
      return false;
    }
    
    console.error("Unexpected error in deletePricePrediction:", error);
    toast.error("An unexpected error occurred while deleting prediction");
    return false;
  }
};

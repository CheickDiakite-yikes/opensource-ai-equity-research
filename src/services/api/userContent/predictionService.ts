
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { Json } from "@/integrations/supabase/types";
import { getUserId, manageItemLimit, testConnection } from "./baseService";

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
    
    // Test connection first to avoid timeouts
    const connectionStatus = await testConnection();
    if (connectionStatus !== 'connected') {
      console.error("Database connection test failed when saving prediction");
      toast.error("Cannot save prediction: Database connection error");
      return null;
    }
    
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
      toast.error("Failed to save prediction: Database error");
      return null;
    }

    console.log("Current prediction count:", count);

    // Manage item limit
    const limitManaged = await manageItemLimit("user_price_predictions", userId, count);
    if (!limitManaged) {
      console.error("Failed to manage item limit");
      toast.error("Failed to save prediction: Could not manage storage limit");
      return null;
    }

    // Prepare the prediction data for insertion
    console.log("Preparing prediction data for database insertion");
    
    // Clean and validate the prediction data
    const cleanedPredictionData = {
      ...predictionData,
      // Ensure these critical fields exist
      symbol: predictionData.symbol || symbol,
      currentPrice: predictionData.currentPrice || 0,
      predictedPrice: predictionData.predictedPrice || {
        oneMonth: 0,
        threeMonths: 0,
        sixMonths: 0,
        oneYear: 0
      },
      // Convert any non-serializable data
      risks: Array.isArray(predictionData.risks) 
        ? predictionData.risks 
        : [],
      keyDrivers: Array.isArray(predictionData.keyDrivers) 
        ? predictionData.keyDrivers 
        : [],
    };
    
    // Now, insert the new prediction - use type cast to Json
    console.log("Inserting prediction into database");
    
    try {
      const { data, error } = await supabase
        .from("user_price_predictions")
        .insert({
          user_id: userId,
          symbol,
          company_name: companyName,
          prediction_data: cleanedPredictionData as unknown as Json,
        })
        .select("id");

      if (error) {
        console.error("Error saving prediction:", error);
        
        // More specific error message based on error code
        if (error.code === "23505") {
          toast.error("This prediction already exists. Please update it instead.");
        } else if (error.code === "23503") {
          toast.error("Authentication error. Please sign in again.");
        } else if (error.code === "42P01") {
          toast.error("Database configuration error. Please contact support.");
        } else {
          toast.error(`Failed to save prediction. Please try again.`);
        }
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
    } catch (insertError) {
      console.error("Exception during database insert:", insertError);
      toast.error("Failed to save prediction. Please try again.");
      return null;
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
    
    // Test connection first
    const connectionStatus = await testConnection();
    if (connectionStatus !== 'connected') {
      console.error("Database connection test failed when getting predictions");
      toast.error("Cannot load predictions: Database connection error");
      return [];
    }
    
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
    if (!predictionId) {
      console.error("No prediction ID provided for deletion");
      toast.error("Failed to delete: Missing prediction ID");
      return false;
    }
    
    // Test connection first
    const connectionStatus = await testConnection();
    if (connectionStatus !== 'connected') {
      console.error("Database connection test failed when deleting prediction");
      toast.error("Cannot delete prediction: Database connection error");
      return false;
    }
    
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
    toast.error("An unexpected error occurred while deleting");
    return false;
  }
};

/**
 * Test if we can insert data in the predictions table
 * (for connection diagnostics)
 */
export const testPredictionInsert = async (): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) {
      return false;
    }
    
    // Create a temporary test record
    const testData = {
      symbol: "_TEST",
      currentPrice: 0,
      predictedPrice: {
        oneMonth: 0,
        threeMonths: 0,
        sixMonths: 0,
        oneYear: 0
      }
    } as StockPrediction;
    
    // Try to insert it
    const { data, error } = await supabase
      .from("user_price_predictions")
      .insert({
        user_id: userId,
        symbol: "_TEST",
        company_name: "Test Company",
        prediction_data: testData as unknown as Json,
      })
      .select("id");
    
    if (error) {
      console.error("Test insert failed:", error);
      return false;
    }
    
    // If insert succeeded, delete the test record
    if (data && data.length > 0) {
      await supabase
        .from("user_price_predictions")
        .delete()
        .eq("id", data[0].id);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in testPredictionInsert:", error);
    return false;
  }
};

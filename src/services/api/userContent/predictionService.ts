
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { Json } from "@/integrations/supabase/types";
import { getUserId, manageItemLimit } from "./baseService";

/**
 * Test if we can insert into the user_price_predictions table
 * This is used for diagnostics only
 */
export const testPredictionInsert = async (): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.log("No user ID found when testing prediction insert");
      return false;
    }
    
    // Use a simple select count query to test permissions
    const { count, error } = await supabase
      .from("user_price_predictions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
      
    if (error) {
      console.error("Error testing prediction permissions:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in testPredictionInsert:", error);
    return false;
  }
};

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
    
    try {
      // Try using the edge function first for better reliability
      console.log("Calling save-price-prediction edge function");
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
        "save-price-prediction",
        {
          body: {
            userId,
            symbol,
            companyName,
            predictionData
          }
        }
      );
      
      if (edgeFunctionError) {
        console.error("Edge function error:", edgeFunctionError);
        // If edge function fails, we'll continue with the direct approach below
      } else if (edgeFunctionData && edgeFunctionData.id) {
        console.log("Edge function success - prediction saved with ID:", edgeFunctionData.id);
        toast.success("Price prediction saved successfully");
        return edgeFunctionData.id;
      }
    } catch (edgeFunctionErr) {
      console.error("Error calling edge function:", edgeFunctionErr);
      // Continue with fallback approach
    }
    
    // Fallback: Direct database insertion if edge function failed
    console.log("Using fallback: direct database insertion");

    // Check for existing predictions with the same symbol
    const { data: existingPredictions, error: queryError } = await supabase
      .from("user_price_predictions")
      .select("id")
      .match({ user_id: userId, symbol })
      .limit(1);
      
    if (queryError) {
      console.error("Error checking for existing predictions:", queryError);
    } else if (existingPredictions && existingPredictions.length > 0) {
      // Update the existing prediction
      console.log("Updating existing prediction for symbol:", symbol);
      
      const { data, error } = await supabase
        .from("user_price_predictions")
        .update({
          company_name: companyName,
          prediction_data: predictionData as unknown as Json,
          created_at: new Date().toISOString()
        })
        .eq("id", existingPredictions[0].id)
        .select("id");
        
      if (error) {
        console.error("Error updating prediction:", error);
        toast.error("Failed to update prediction: " + error.message);
        return null;
      }
      
      console.log("Prediction updated successfully. ID:", existingPredictions[0].id);
      toast.success("Price prediction updated successfully");
      return existingPredictions[0].id;
    }
    
    // If no existing prediction found or couldn't query, insert a new one
    console.log("Inserting new prediction for symbol:", symbol);
    
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

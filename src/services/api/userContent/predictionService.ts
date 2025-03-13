
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
    
    // Calculate expiration date (30 days from now)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
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
        throw new Error(`Edge function error: ${edgeFunctionError.message}`);
      } 
      
      if (edgeFunctionData && edgeFunctionData.id) {
        console.log("Edge function success - prediction saved with ID:", edgeFunctionData.id);
        toast.success("Price prediction saved successfully");
        return edgeFunctionData.id;
      }
      
      // If edge function didn't return an ID but didn't throw an error either
      if (edgeFunctionData) {
        console.error("Edge function returned data but no ID:", edgeFunctionData);
        throw new Error("Edge function response missing ID");
      }
      
      throw new Error("Edge function returned no data");
      
    } catch (edgeFunctionErr) {
      console.error("Error with edge function, using direct approach:", edgeFunctionErr);
      
      // Fallback: Direct database operations if edge function failed
      console.log("Using fallback: direct database operations");

      // Step 1: Delete any existing predictions for this user and symbol
      console.log("Deleting any existing predictions for symbol:", symbol);
      const { error: deleteError } = await supabase
        .from("user_price_predictions")
        .delete()
        .eq("user_id", userId)
        .eq("symbol", symbol);
        
      if (deleteError) {
        console.error("Error deleting existing predictions:", deleteError);
        toast.error("Failed to update prediction: " + deleteError.message);
        return null;
      }
      
      // Step 2: Insert a new prediction with explicit columns
      console.log("Inserting new prediction for symbol:", symbol);
      const { data, error } = await supabase
        .from("user_price_predictions")
        .insert({
          user_id: userId,
          symbol,
          company_name: companyName,
          prediction_data: predictionData as unknown as Json,
          expires_at: expiresAt,
          created_at: new Date().toISOString()
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

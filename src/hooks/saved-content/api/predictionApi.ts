
import { 
  getUserPricePredictions,
  deletePricePrediction,
  savePricePrediction 
} from "@/services/api/userContent";
import { testConnection, getDiagnosticInfo } from "@/services/api/userContent/baseService";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { SavedPrediction } from "../types/predictionTypes";
import { toast } from "sonner";

export const fetchUserPredictions = async (): Promise<SavedPrediction[]> => {
  console.log("Fetching user price predictions");
  try {
    const data = await getUserPricePredictions();
    console.log("Raw data from getUserPricePredictions:", data);
      
    if (data.length === 0) {
      console.log("No predictions found for user");
      return [];
    }
      
    // Convert Json type to StockPrediction type with type assertion
    const convertedPredictions = data.map(item => {
      console.log(`Processing prediction ${item.id}:`, {
        symbol: item.symbol,
        company_name: item.company_name,
        created_at: item.created_at,
        expires_at: item.expires_at
      });
        
      // Validate prediction_data
      if (!item.prediction_data) {
        console.error(`Prediction ${item.id} has no prediction_data!`);
        return {
          ...item,
          prediction_data: {
            symbol: item.symbol,
            currentPrice: 0,
            predictedPrice: {
              oneMonth: 0,
              threeMonths: 0, 
              sixMonths: 0,
              oneYear: 0
            }
          } as StockPrediction
        };
      }
        
      return {
        ...item,
        prediction_data: item.prediction_data as unknown as StockPrediction
      };
    }) as SavedPrediction[];
      
    console.log(`Fetched ${convertedPredictions.length} predictions`);
    return convertedPredictions;
  } catch (err) {
    console.error("Error in fetchUserPredictions:", err);
    throw err;
  }
};

export const removeUserPrediction = async (predictionId: string): Promise<boolean> => {
  console.log("Deleting prediction:", predictionId);
  try {
    const status = await testConnection();
      
    if (status !== 'connected') {
      toast.error("Cannot delete prediction: Database connection error");
      return false;
    }
      
    const success = await deletePricePrediction(predictionId);
    if (success) {
      console.log("Prediction deleted successfully");
    } else {
      console.error("Failed to delete prediction");
    }
    return success;
  } catch (err) {
    console.error("Error in removeUserPrediction:", err);
    toast.error("Failed to delete prediction due to an error");
    return false;
  }
};

export const saveUserPrediction = async (
  symbol: string, 
  companyName: string, 
  predictionData: StockPrediction
): Promise<string | null> => {
  console.log("Saving prediction for:", symbol, companyName);
    
  try {
    const status = await testConnection();
      
    if (status !== 'connected') {
      toast.error("Cannot save prediction: Database connection error");
      return null;
    }
      
    const predictionId = await savePricePrediction(symbol, companyName, predictionData);
    console.log("Save result - prediction ID:", predictionId);
      
    if (predictionId) {
      console.log("Prediction saved successfully");
      return predictionId;
    } else {
      console.error("Failed to save prediction - no ID returned");
      return null;
    }
  } catch (err) {
    console.error("Error in saveUserPrediction:", err);
    toast.error("Failed to save prediction due to an unexpected error");
    return null;
  }
};

export const getDatabaseStatus = async () => {
  try {
    // Check connection
    const status = await testConnection();
      
    // Get diagnostic info
    const diagnostics = await getDiagnosticInfo();
      
    return {
      status,
      diagnostics
    };
  } catch (err) {
    console.error("Error getting database status:", err);
    return {
      status: 'error',
      diagnostics: { error: err }
    };
  }
};

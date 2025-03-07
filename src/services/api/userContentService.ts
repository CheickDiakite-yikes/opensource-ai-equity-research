import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";

// Maximum number of reports/predictions to keep per user
const MAX_SAVED_ITEMS = 10;

/**
 * Save a research report for the current user
 */
export const saveResearchReport = async (
  symbol: string,
  companyName: string,
  reportData: ResearchReport
): Promise<string | null> => {
  try {
    const user = supabase.auth.getUser();
    if (!(await user).data.user) {
      toast.error("You must be signed in to save reports");
      return null;
    }

    const userId = (await user).data.user.id;

    // First, count existing reports
    const { count, error: countError } = await supabase
      .from("user_research_reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Error counting reports:", countError);
      toast.error("Failed to save report");
      return null;
    }

    // If at limit, delete oldest
    if (count && count >= MAX_SAVED_ITEMS) {
      const { data: oldestReports, error: fetchError } = await supabase
        .from("user_research_reports")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(count - MAX_SAVED_ITEMS + 1);

      if (fetchError) {
        console.error("Error fetching oldest reports:", fetchError);
        toast.error("Failed to manage saved reports");
        return null;
      }

      if (oldestReports && oldestReports.length > 0) {
        const oldestIds = oldestReports.map(report => report.id);
        const { error: deleteError } = await supabase
          .from("user_research_reports")
          .delete()
          .in("id", oldestIds);

        if (deleteError) {
          console.error("Error deleting old reports:", deleteError);
          toast.error("Failed to manage saved reports");
          return null;
        }
      }
    }

    // Now, insert the new report
    const { data, error } = await supabase
      .from("user_research_reports")
      .insert({
        user_id: userId,
        symbol,
        company_name: companyName,
        report_data: reportData,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error saving report:", error);
      toast.error("Failed to save report");
      return null;
    }

    toast.success("Research report saved successfully");
    return data.id;
  } catch (error) {
    console.error("Error in saveResearchReport:", error);
    toast.error("An unexpected error occurred");
    return null;
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
    const user = supabase.auth.getUser();
    if (!(await user).data.user) {
      toast.error("You must be signed in to save predictions");
      return null;
    }

    const userId = (await user).data.user.id;

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

    // If at limit, delete oldest
    if (count && count >= MAX_SAVED_ITEMS) {
      const { data: oldestPredictions, error: fetchError } = await supabase
        .from("user_price_predictions")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(count - MAX_SAVED_ITEMS + 1);

      if (fetchError) {
        console.error("Error fetching oldest predictions:", fetchError);
        toast.error("Failed to manage saved predictions");
        return null;
      }

      if (oldestPredictions && oldestPredictions.length > 0) {
        const oldestIds = oldestPredictions.map(prediction => prediction.id);
        const { error: deleteError } = await supabase
          .from("user_price_predictions")
          .delete()
          .in("id", oldestIds);

        if (deleteError) {
          console.error("Error deleting old predictions:", deleteError);
          toast.error("Failed to manage saved predictions");
          return null;
        }
      }
    }

    // Now, insert the new prediction
    const { data, error } = await supabase
      .from("user_price_predictions")
      .insert({
        user_id: userId,
        symbol,
        company_name: companyName,
        prediction_data: predictionData,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error saving prediction:", error);
      toast.error("Failed to save prediction");
      return null;
    }

    toast.success("Price prediction saved successfully");
    return data.id;
  } catch (error) {
    console.error("Error in savePricePrediction:", error);
    toast.error("An unexpected error occurred");
    return null;
  }
};

/**
 * Get all saved research reports for the current user
 */
export const getUserResearchReports = async () => {
  try {
    const user = supabase.auth.getUser();
    if (!(await user).data.user) {
      return [];
    }

    const userId = (await user).data.user.id;

    const { data, error } = await supabase
      .from("user_research_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user reports:", error);
      toast.error("Failed to load saved reports");
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserResearchReports:", error);
    toast.error("An unexpected error occurred");
    return [];
  }
};

/**
 * Get all saved price predictions for the current user
 */
export const getUserPricePredictions = async () => {
  try {
    const user = supabase.auth.getUser();
    if (!(await user).data.user) {
      return [];
    }

    const userId = (await user).data.user.id;

    const { data, error } = await supabase
      .from("user_price_predictions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user predictions:", error);
      toast.error("Failed to load saved predictions");
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserPricePredictions:", error);
    toast.error("An unexpected error occurred");
    return [];
  }
};

/**
 * Delete a research report by ID
 */
export const deleteResearchReport = async (reportId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_research_reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
      return false;
    }

    toast.success("Report deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteResearchReport:", error);
    toast.error("An unexpected error occurred");
    return false;
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

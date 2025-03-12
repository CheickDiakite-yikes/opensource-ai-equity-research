
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Maximum number of reports/predictions to keep per user
export const MAX_SAVED_ITEMS = 10;

/**
 * Check if user is authenticated and return user ID
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      console.log("No authenticated user found");
      return null;
    }
    console.log("Authenticated user ID:", data.user.id);
    return data.user.id;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

/**
 * Manage maximum items per user - delete oldest if over limit
 */
export const manageItemLimit = async (
  tableName: "user_research_reports" | "user_price_predictions",
  userId: string,
  count: number | null
): Promise<boolean> => {
  try {
    if (!count || count < MAX_SAVED_ITEMS) {
      return true;
    }

    // If at limit, delete oldest items one by one
    const { data: oldestItems, error: fetchError } = await supabase
      .from(tableName)
      .select("id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(count - MAX_SAVED_ITEMS + 1);

    if (fetchError) {
      console.error(`Error fetching oldest ${tableName}:`, fetchError);
      toast.error(`Failed to manage saved items`);
      return false;
    }

    if (oldestItems && oldestItems.length > 0) {
      console.log(`Deleting ${oldestItems.length} oldest ${tableName}`, 
        oldestItems.map(item => ({ id: item.id, created_at: item.created_at })));
      
      // Delete items one by one to avoid potential issues
      let allDeletesSuccessful = true;
      
      for (const item of oldestItems) {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq("id", item.id);
          
        if (deleteError) {
          console.error(`Error deleting item ${item.id} from ${tableName}:`, deleteError);
          allDeletesSuccessful = false;
        }
      }
      
      if (!allDeletesSuccessful) {
        toast.error(`Some items could not be deleted automatically`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error in manageItemLimit for ${tableName}:`, error);
    return false;
  }
};

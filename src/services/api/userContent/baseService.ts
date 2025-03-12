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
      console.log(`Current count (${count}) is below limit (${MAX_SAVED_ITEMS}), no cleanup needed`);
      return true;
    }

    // Calculate how many items need to be deleted
    const deleteCount = count - MAX_SAVED_ITEMS + 1;
    console.log(`Need to delete ${deleteCount} oldest items from ${tableName}`);

    // If at limit, delete oldest
    const { data: oldestItems, error: fetchError } = await supabase
      .from(tableName)
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(deleteCount);

    if (fetchError) {
      console.error(`Error fetching oldest ${tableName}:`, fetchError);
      toast.error(`Failed to manage saved ${tableName}`);
      return false;
    }

    if (!oldestItems || oldestItems.length === 0) {
      console.log(`No items found to delete from ${tableName}`);
      return true;
    }
    
    console.log(`Found ${oldestItems.length} items to delete from ${tableName}`);
    
    // Delete items one by one to avoid potential issues
    for (const item of oldestItems) {
      console.log(`Deleting item ${item.id} from ${tableName}`);
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq("id", item.id);

      if (deleteError) {
        console.error(`Error deleting item ${item.id} from ${tableName}:`, deleteError);
        // Continue with other deletions even if one fails
      } else {
        console.log(`Successfully deleted item ${item.id} from ${tableName}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error in manageItemLimit for ${tableName}:`, error);
    return false;
  }
};


import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Maximum number of reports/predictions to keep per user
export const MAX_SAVED_ITEMS = 10;

/**
 * Check if user is authenticated and return user ID
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Authentication error:", error.message);
      toast.error("Authentication error: " + error.message);
      return null;
    }
    
    if (!data.user) {
      console.log("No authenticated user found");
      return null;
    }
    
    console.log("Authenticated user ID:", data.user.id);
    return data.user.id;
  } catch (error) {
    console.error("Error getting user ID:", error);
    toast.error("Failed to verify authentication status");
    return null;
  }
};

/**
 * Count items in table for a user
 */
export const countUserItems = async (
  tableName: "user_research_reports" | "user_price_predictions",
  userId: string
): Promise<number> => {
  try {
    // Double check userId is valid before proceeding
    if (!userId) {
      console.error(`No user ID provided when counting ${tableName}`);
      return 0;
    }
    
    const { count, error } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error(`Error counting ${tableName}:`, error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error(`Error in countUserItems for ${tableName}:`, error);
    return 0;
  }
};

/**
 * Delete oldest items if over limit
 */
export const deleteOldestItems = async (
  tableName: "user_research_reports" | "user_price_predictions",
  userId: string,
  count: number
): Promise<boolean> => {
  try {
    // Double check userId is valid before proceeding
    if (!userId) {
      console.error(`No user ID provided when deleting oldest ${tableName}`);
      return false;
    }
    
    if (count < MAX_SAVED_ITEMS) {
      return true;
    }

    // If at or over limit, delete oldest to make room
    const toDelete = count - MAX_SAVED_ITEMS + 1;
    console.log(`Need to delete ${toDelete} oldest ${tableName}`);
    
    // Fetch oldest items
    const { data: oldestItems, error: fetchError } = await supabase
      .from(tableName)
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(toDelete);

    if (fetchError) {
      console.error(`Error fetching oldest ${tableName}:`, fetchError);
      toast.error(`Failed to manage saved ${tableName}`);
      return false;
    }

    if (!oldestItems || oldestItems.length === 0) {
      console.log(`No old ${tableName} found to delete`);
      return false;
    }

    const oldestIds = oldestItems.map(item => item.id);
    console.log(`Deleting oldest ${tableName}:`, oldestIds);
    
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .in("id", oldestIds);

    if (deleteError) {
      console.error(`Error deleting old ${tableName}:`, deleteError);
      toast.error(`Failed to manage saved ${tableName}`);
      return false;
    }
    
    console.log(`Successfully deleted ${oldestIds.length} old ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error in deleteOldestItems for ${tableName}:`, error);
    return false;
  }
};

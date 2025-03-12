
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Get the current user ID
 * @returns User ID or null if not logged in
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (userId) {
      console.log("Authenticated user ID:", userId);
      return userId;
    }
    
    console.log("No authenticated user found");
    return null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

/**
 * Type-safe table name for Supabase queries
 */
type UserContentTable = 'user_price_predictions' | 'user_research_reports';

/**
 * Manage item limit for user content tables
 * Delete oldest items if the user has reached the limit
 * @param tableName - The name of the table to manage
 * @param userId - The user ID
 * @param currentCount - The current number of items for this user
 * @returns true if managed successfully, false otherwise
 */
export const manageItemLimit = async (
  tableName: UserContentTable,
  userId: string,
  currentCount: number
): Promise<boolean> => {
  try {
    const MAX_ITEMS = 10; // Maximum number of items per user
    
    if (currentCount < MAX_ITEMS) {
      console.log(`User has ${currentCount} items in ${tableName}, under the limit of ${MAX_ITEMS}`);
      return true;
    }
    
    console.log(`User has reached the limit of ${MAX_ITEMS} items in ${tableName}, deleting oldest`);
    
    // Calculate how many items to delete
    const itemsToDelete = currentCount - MAX_ITEMS + 1; // +1 to make room for the new item
    
    // Find the oldest items
    const { data: oldestItems, error: findError } = await supabase
      .from(tableName)
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(itemsToDelete);
    
    if (findError) {
      console.error(`Error finding oldest ${tableName}:`, findError);
      return false;
    }
    
    if (!oldestItems || oldestItems.length === 0) {
      console.error(`No ${tableName} found to delete`);
      return false;
    }
    
    // Get array of IDs to delete
    const idsToDelete = oldestItems.map(item => item.id);
    console.log(`Deleting oldest ${tableName}:`, idsToDelete);
    
    // Delete items one by one to avoid ON CONFLICT issues
    for (const id of idsToDelete) {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error(`Error deleting ${tableName} ${id}:`, deleteError);
        // Continue with other deletions even if one fails
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error in manageItemLimit for ${tableName}:`, error);
    return false;
  }
};

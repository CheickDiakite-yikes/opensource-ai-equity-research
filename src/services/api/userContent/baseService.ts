
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
      console.error("Error getting user:", error);
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

    // If at limit, delete oldest
    const { data: oldestItems, error: fetchError } = await supabase
      .from(tableName)
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(count - MAX_SAVED_ITEMS + 1);

    if (fetchError) {
      console.error(`Error fetching oldest ${tableName}:`, fetchError);
      toast.error(`Failed to manage saved ${tableName}`);
      return false;
    }

    if (oldestItems && oldestItems.length > 0) {
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
    }
    
    return true;
  } catch (error) {
    console.error(`Error in manageItemLimit for ${tableName}:`, error);
    return false;
  }
};

/**
 * Check if a table exists in the database - using raw SQL query approach
 */
export const checkIfTableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Use rpc to call a Postgres function instead of direct schema query
    const { data, error } = await supabase.rpc('table_exists', { 
      schema_name: 'public', 
      table_name: tableName 
    });
    
    if (error) {
      console.error("Error checking if table exists:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error in checkIfTableExists:", error);
    return false;
  }
};

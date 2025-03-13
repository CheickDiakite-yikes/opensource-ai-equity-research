
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Maximum number of reports/predictions to keep per user
export const MAX_SAVED_ITEMS = 20;

// Error class for better debugging
export class UserContentError extends Error {
  public details: any;
  public source: string;
  
  constructor(message: string, source: string, details?: any) {
    super(message);
    this.name = "UserContentError";
    this.source = source;
    this.details = details;
    
    // Log all errors to console for debugging
    console.error(`[${source}] ${message}`, details);
  }
}

/**
 * Check if user is authenticated and return user ID
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new UserContentError("Authentication error", "getUserId", error);
    }
    
    if (!data.user) {
      console.log("No authenticated user found");
      return null;
    }
    
    console.log("Authenticated user ID:", data.user.id);
    return data.user.id;
  } catch (error) {
    if (error instanceof UserContentError) {
      throw error;
    }
    throw new UserContentError("Error getting user ID", "getUserId", error);
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

    console.log(`Managing item limit for ${tableName}, current count: ${count}`);
    
    // If at limit, delete oldest
    const { data: oldestItems, error: fetchError } = await supabase
      .from(tableName)
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(count - MAX_SAVED_ITEMS + 1);

    if (fetchError) {
      throw new UserContentError(`Error fetching oldest ${tableName}`, "manageItemLimit", fetchError);
    }

    if (oldestItems && oldestItems.length > 0) {
      const oldestIds = oldestItems.map(item => item.id);
      console.log(`Deleting oldest ${tableName}:`, oldestIds);
      
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .in("id", oldestIds);

      if (deleteError) {
        throw new UserContentError(`Error deleting old ${tableName}`, "manageItemLimit", deleteError);
      }
      
      console.log(`Successfully deleted ${oldestIds.length} old items from ${tableName}`);
    }
    
    return true;
  } catch (error) {
    if (error instanceof UserContentError) {
      toast.error(error.message);
      throw error;
    }
    
    const userContentError = new UserContentError(
      `Error in manageItemLimit for ${tableName}`, 
      "manageItemLimit", 
      error
    );
    toast.error(userContentError.message);
    throw userContentError;
  }
};

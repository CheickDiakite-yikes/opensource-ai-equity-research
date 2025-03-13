
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Maximum number of reports/predictions to keep per user
export const MAX_SAVED_ITEMS = 10;

// Connection status and diagnostics
export type ConnectionStatus = 'connected' | 'disconnected' | 'unknown';
let currentConnectionStatus: ConnectionStatus = 'unknown';

/**
 * Test connection to Supabase database
 */
export const testConnection = async (): Promise<ConnectionStatus> => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('user_price_predictions').select('count(*)', { count: 'exact', head: true });
    const latency = Date.now() - startTime;
    
    if (error) {
      console.error("Database connection test failed:", error);
      currentConnectionStatus = 'disconnected';
      return 'disconnected';
    }
    
    console.log(`Database connection successful. Latency: ${latency}ms`);
    currentConnectionStatus = 'connected';
    return 'connected';
  } catch (err) {
    console.error("Exception during connection test:", err);
    currentConnectionStatus = 'disconnected';
    return 'disconnected';
  }
};

/**
 * Get current connection status
 */
export const getConnectionStatus = (): ConnectionStatus => {
  return currentConnectionStatus;
};

/**
 * Check if user is authenticated and return user ID
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Error getting authenticated user:", error);
      return null;
    }
    
    if (!data || !data.user) {
      console.log("No authenticated user found");
      return null;
    }
    
    console.log("Authenticated user ID:", data.user.id);
    return data.user.id;
  } catch (error) {
    console.error("Exception in getUserId:", error);
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
    if (count === null || count < MAX_SAVED_ITEMS) {
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
 * Get diagnostic information about the current connection
 */
export const getDiagnosticInfo = async (): Promise<{
  connected: boolean;
  authStatus: string;
  latency?: number;
  lastError?: string;
}> => {
  try {
    // Test basic connectivity
    const startTime = Date.now();
    const { error: pingError } = await supabase.from('user_price_predictions').select('count(*)', { count: 'exact', head: true });
    const latency = Date.now() - startTime;
    
    // Check authentication
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (pingError) {
      return {
        connected: false,
        authStatus: 'unknown',
        lastError: pingError.message
      };
    }
    
    if (authError) {
      return {
        connected: true,
        latency,
        authStatus: 'error',
        lastError: authError.message
      };
    }
    
    return {
      connected: true,
      latency,
      authStatus: userData?.user ? 'authenticated' : 'not-authenticated'
    };
  } catch (err) {
    return {
      connected: false,
      authStatus: 'error',
      lastError: err instanceof Error ? err.message : String(err)
    };
  }
};


import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Run maintenance tasks on the database to improve performance
 */
export const runDatabaseMaintenance = async (): Promise<boolean> => {
  try {
    console.log("Running database maintenance tasks...");
    
    const { data, error } = await supabase.functions.invoke("optimize-database", {
      body: { action: "maintenance" }
    });
    
    if (error) {
      console.error("Error running database maintenance:", error);
      toast({
        title: "Database Maintenance Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    
    console.log("Database maintenance completed:", data);
    toast({
      title: "Database Optimized",
      description: "Database maintenance completed successfully.",
      variant: "default",
    });
    
    return true;
  } catch (err) {
    console.error("Error in runDatabaseMaintenance:", err);
    toast({
      title: "Database Maintenance Error",
      description: `An unexpected error occurred: ${err.message}`,
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Initialize database with optimal structure and indexes
 */
export const initializeDatabaseStructure = async (): Promise<boolean> => {
  try {
    console.log("Setting up database tables and indexes...");
    
    const { data, error } = await supabase.functions.invoke("optimize-database", {
      body: { action: "setup-tables" }
    });
    
    if (error) {
      console.error("Error setting up database tables:", error);
      return false;
    }
    
    console.log("Database structure initialized:", data);
    return true;
  } catch (err) {
    console.error("Error in initializeDatabaseStructure:", err);
    return false;
  }
};

/**
 * Clean up expired cache entries
 */
export const cleanupExpiredCache = async (): Promise<boolean> => {
  try {
    console.log("Cleaning up expired cache entries...");
    
    const { data, error } = await supabase.functions.invoke("optimize-database", {
      body: { action: "cleanup-cache" }
    });
    
    if (error) {
      console.error("Error cleaning up cache:", error);
      return false;
    }
    
    console.log("Cache cleanup completed:", data);
    return true;
  } catch (err) {
    console.error("Error in cleanupExpiredCache:", err);
    return false;
  }
};

/**
 * Optimize database indexes
 */
export const optimizeIndexes = async (): Promise<boolean> => {
  try {
    console.log("Optimizing database indexes...");
    
    const { data, error } = await supabase.functions.invoke("optimize-database", {
      body: { action: "optimize-indexes" }
    });
    
    if (error) {
      console.error("Error optimizing indexes:", error);
      return false;
    }
    
    console.log("Index optimization completed:", data);
    return true;
  } catch (err) {
    console.error("Error in optimizeIndexes:", err);
    return false;
  }
};

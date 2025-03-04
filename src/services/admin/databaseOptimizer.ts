
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Service for database optimization tasks
 */
export const databaseOptimizer = {
  /**
   * Setup database tables, functions, and procedures
   */
  async setupTables(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('optimize-database', {
        body: { action: 'setup-tables' }
      });
      
      if (error) {
        console.error("Error setting up database tables:", error);
        toast.error("Failed to setup database tables");
        return false;
      }
      
      console.log("Database tables setup result:", data);
      toast.success("Database tables and functions setup successfully");
      return true;
    } catch (err) {
      console.error("Error in setupTables:", err);
      toast.error(`Database setup failed: ${err.message}`);
      return false;
    }
  },
  
  /**
   * Optimize existing database indexes
   */
  async optimizeIndexes(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('optimize-database', {
        body: { action: 'optimize-indexes' }
      });
      
      if (error) {
        console.error("Error optimizing database indexes:", error);
        toast.error("Failed to optimize database indexes");
        return false;
      }
      
      console.log("Database index optimization result:", data);
      toast.success("Database indexes optimized successfully");
      return true;
    } catch (err) {
      console.error("Error in optimizeIndexes:", err);
      toast.error(`Database optimization failed: ${err.message}`);
      return false;
    }
  },
  
  /**
   * Cleanup expired cache entries
   */
  async cleanupCache(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('optimize-database', {
        body: { action: 'cleanup-cache' }
      });
      
      if (error) {
        console.error("Error cleaning up cache:", error);
        toast.error("Failed to clean up cache");
        return false;
      }
      
      console.log("Cache cleanup result:", data);
      toast.success("Expired cache entries cleaned up successfully");
      return true;
    } catch (err) {
      console.error("Error in cleanupCache:", err);
      toast.error(`Cache cleanup failed: ${err.message}`);
      return false;
    }
  },
  
  /**
   * Run all optimization tasks
   */
  async optimizeAll(): Promise<boolean> {
    try {
      toast.info("Starting database optimization...");
      
      await this.setupTables();
      await this.optimizeIndexes();
      await this.cleanupCache();
      
      toast.success("Database optimization completed successfully");
      return true;
    } catch (err) {
      console.error("Error in optimizeAll:", err);
      toast.error(`Database optimization failed: ${err.message}`);
      return false;
    }
  }
};

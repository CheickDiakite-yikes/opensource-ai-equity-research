
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cacheService } from "@/services/cache/cacheService";

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
      // First clear the client-side cache
      cacheService.clearExpired();
      
      // Then clean the server-side cache
      const { data, error } = await supabase.functions.invoke('optimize-database', {
        body: { action: 'cleanup-cache' }
      });
      
      if (error) {
        console.error("Error cleaning up cache:", error);
        toast.error("Failed to clean up server cache");
        return false;
      }
      
      console.log("Cache cleanup result:", data);
      toast.success("Cache cleaned up successfully");
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
      
      // First clear local cache
      cacheService.clearExpired();
      console.log("Local cache cleaned");
      
      // Then run server-side optimizations
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
  },
  
  /**
   * Get cache statistics
   */
  getLocalCacheStats() {
    return cacheService.getStats();
  },
  
  /**
   * Get database cache statistics
   */
  async getServerCacheStats(): Promise<any> {
    try {
      const { data, error } = await supabase.from('api_cache')
        .select('*', { count: 'exact' });
        
      if (error) {
        console.error("Error fetching cache stats:", error);
        return { error: error.message };
      }
      
      // Calculate some basic stats
      let oldestEntry = new Date();
      let newestEntry = new Date(0);
      let totalSize = 0;
      
      data.forEach(entry => {
        const entryDate = new Date(entry.created_at);
        if (entryDate < oldestEntry) oldestEntry = entryDate;
        if (entryDate > newestEntry) newestEntry = entryDate;
        
        // Estimate size
        const dataSize = JSON.stringify(entry.data).length;
        totalSize += dataSize;
      });
      
      return {
        count: data.length,
        oldestEntry,
        newestEntry,
        estimatedSize: Math.round(totalSize / 1024) // KB
      };
    } catch (err) {
      console.error("Error in getServerCacheStats:", err);
      return { error: err.message };
    }
  }
};

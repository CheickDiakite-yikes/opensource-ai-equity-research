
/**
 * Helper to schedule the cache cleanup task
 */
export async function scheduleCacheCleanup(supabase: any): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('schedule_cache_cleanup');
    
    if (error) {
      console.error("Error scheduling cache cleanup:", error);
      return false;
    }
    
    console.log("Successfully scheduled cache cleanup");
    return true;
  } catch (err) {
    console.error("Error in scheduleCacheCleanup:", err);
    return false;
  }
}

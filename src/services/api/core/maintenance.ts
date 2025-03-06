
import { invokeSupabaseFunction } from "./edgeFunctions";

/**
 * Function to run regular database maintenance
 */
export const runDatabaseMaintenance = async (): Promise<boolean> => {
  try {
    const result = await invokeSupabaseFunction<{ success: boolean }>('optimize-database', {
      action: 'maintenance'
    });
    
    return result.success;
  } catch (err) {
    console.error("Error running database maintenance:", err);
    return false;
  }
};

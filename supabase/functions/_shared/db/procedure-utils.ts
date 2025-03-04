
/**
 * Utility functions for stored procedures
 */

/**
 * Helper function to create or execute a stored procedure
 */
export async function executeStoredProcedure(
  supabase: any,
  procedureName: string,
  procedureSQL: string
): Promise<boolean> {
  try {
    // Execute the procedure or create it if it doesn't exist
    const { error } = await supabase.rpc('execute_sql', {
      sql_statement: procedureSQL
    });
    
    if (error) {
      console.error(`Error executing/creating stored procedure ${procedureName}:`, error);
      return false;
    }
    
    console.log(`Successfully executed/created stored procedure ${procedureName}`);
    return true;
  } catch (err) {
    console.error(`Error in executeStoredProcedure for ${procedureName}:`, err);
    return false;
  }
}

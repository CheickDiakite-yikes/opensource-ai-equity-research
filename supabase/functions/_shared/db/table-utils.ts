
/**
 * Database table utility functions
 */

/**
 * Check if a table exists in the database
 */
export async function tableExists(
  supabase: any,
  table: string,
  schema: string = 'public'
): Promise<boolean> {
  try {
    // Query the information_schema to check if the table exists
    const { data, error } = await supabase.rpc('table_exists', {
      table_name: table,
      schema_name: schema
    });
    
    if (error) {
      console.error("Error checking if table exists:", error);
      return false;
    }
    
    return data;
  } catch (err) {
    console.error("Error in tableExists:", err);
    return false;
  }
}

/**
 * Add the stored procedure for table existence checking
 */
export async function addTableExistsFunction(supabase: any): Promise<boolean> {
  try {
    // Add the function if it doesn't exist
    const { error } = await supabase.rpc('execute_sql', {
      sql_statement: `
        CREATE OR REPLACE FUNCTION table_exists(schema_name text, table_name text)
        RETURNS boolean
        LANGUAGE plpgsql
        AS $$
        DECLARE
          exists_val boolean;
        BEGIN
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = schema_name
            AND table_name = table_name
          ) INTO exists_val;
          
          RETURN exists_val;
        END;
        $$;
      `
    });
    
    if (error) {
      console.error("Error creating table_exists function:", error);
      return false;
    }
    
    console.log("Successfully created/updated table_exists function");
    return true;
  } catch (err) {
    console.error("Error in addTableExistsFunction:", err);
    return false;
  }
}

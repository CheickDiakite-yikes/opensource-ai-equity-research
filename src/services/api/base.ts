
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Base API function to invoke Supabase functions with error handling
 */
export const invokeSupabaseFunction = async <T>(
  functionName: string, 
  payload: any
): Promise<T | null> => {
  try {
    console.log(`Invoking Supabase function: ${functionName}`, payload);
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });

    if (error) {
      console.error(`Error invoking ${functionName}:`, error);
      throw new Error(error.message || `Failed to invoke ${functionName}`);
    }
    
    if (!data) {
      console.warn(`No data returned from ${functionName}`);
      return null;
    }
    
    console.log(`Received data from ${functionName}:`, data);
    return data as T;
  } catch (error: any) {
    console.error(`Error invoking ${functionName}:`, error);
    
    // Show a toast error only if it's not a server connection issue
    // to avoid flooding users with errors during connectivity issues
    if (!error.message?.includes('Failed to fetch') && 
        !error.message?.includes('Network error')) {
      toast({
        title: "API Error",
        description: `Error fetching data: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
    
    throw error;
  }
};

/**
 * Utility to retry a function with exponential backoff
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoff = 2
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.info(`Retrying after ${delay}ms, ${retries} retries left`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return withRetry(fn, retries - 1, delay * backoff, backoff);
  }
};

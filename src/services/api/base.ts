
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Create a supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generic function to invoke a Supabase Edge Function
 */
export const invokeSupabaseFunction = async <T>(
  functionName: string,
  payload: any
): Promise<T> => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      console.error(`Error invoking ${functionName}:`, error);
      throw new Error(`API error (${functionName}): ${error.message}`);
    }

    if (data && data.error) {
      console.error(`API error from ${functionName}:`, data.error);
      throw new Error(`API error (${functionName}): ${data.error}`);
    }

    return data as T;
  } catch (err) {
    // Special handling for network errors
    if (err instanceof Error && err.message.includes('Failed to fetch')) {
      console.error(`Network error calling ${functionName}:`, err);
      
      // Don't show toast for connection issues as they often happen in development
      // and can be spammy, but log them clearly
      console.warn("⚠️ Connection issue detected. Make sure Supabase Edge Functions are deployed.");
      
      throw new Error(`Network error: Could not connect to ${functionName}. Please check your internet connection.`);
    }
    
    // Show toast for other errors
    const errorMessage = err instanceof Error ? err.message : String(err);
    toast.error(`API error: ${errorMessage}`, {
      duration: 5000,
    });
    
    throw err;
  }
};

/**
 * Utility function to retry an API call with exponential backoff
 * @param fn Function to retry
 * @param retries Number of retries
 * @param delay Initial delay in ms
 * @returns Result of the function
 */
export const withRetry = async <T>(
  fn: () => Promise<T>, 
  retries = 2, 
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Retrying API call... ${retries} attempts left`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Exponential backoff
    return withRetry(fn, retries - 1, delay * 2);
  }
};

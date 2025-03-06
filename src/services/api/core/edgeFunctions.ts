import { supabase } from "./supabaseClient";
import { toast } from "sonner";
import { withRetry } from "./retryStrategy";

/**
 * Generic function to invoke a Supabase Edge Function
 */
export const invokeSupabaseFunction = async <T>(
  functionName: string,
  payload: any
): Promise<T> => {
  try {
    console.log(`Invoking Supabase function: ${functionName} with payload:`, payload);
    
    // Add timestamp to help prevent caching issues
    const enhancedPayload = {
      ...payload,
      _timestamp: new Date().getTime()
    };
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: enhancedPayload,
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
      
      // Log the error clearly but don't show a toast for network issues
      console.warn("⚠️ Connection issue detected. Make sure Supabase Edge Functions are deployed.");
      
      throw new Error(`Network error: Could not connect to ${functionName}. Please check your internet connection.`);
    }
    
    // Suppress toast for repeated errors (show max once per minute per function)
    const errorKey = `error_${functionName}_${Math.floor(Date.now() / 60000)}`;
    const hasShownRecently = sessionStorage.getItem(errorKey);
    
    if (!hasShownRecently) {
      // Show toast for other errors
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`API error: ${errorMessage}`, {
        duration: 5000,
      });
      
      // Mark that we've shown this error recently
      sessionStorage.setItem(errorKey, "true");
    }
    
    throw err;
  }
};

// Re-export withRetry for backward compatibility
export { withRetry };

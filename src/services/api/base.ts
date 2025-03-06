
import { supabase } from "@/integrations/supabase/client";

/**
 * Base function to invoke a Supabase function with error handling and retry logic.
 */
export const invokeSupabaseFunction = async <T>(
  functionName: string,
  payload: object
): Promise<{ data: T | null, error: Error | null }> => {
  try {
    console.log(`Invoking Supabase function ${functionName} with payload:`, payload);
    
    const result = await supabase.functions.invoke(functionName, {
      body: payload,
    });
    
    if (result.error) {
      console.error(`Supabase function ${functionName} error:`, result.error);
      return { 
        data: null, 
        error: new Error(result.error.message || `Failed to invoke ${functionName}`) 
      };
    }
    
    console.log(`Supabase function ${functionName} success:`, result.data);
    return { data: result.data as T, error: null };
  } catch (err: any) {
    console.error(`Exception invoking Supabase function ${functionName}:`, err);
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error(String(err)) 
    };
  }
};

/**
 * Utility function to retry an async operation with exponential backoff
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}):`, error);
      
      // Don't wait after the last attempt
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

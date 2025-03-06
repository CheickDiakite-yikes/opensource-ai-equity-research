
import { supabase } from "@/integrations/supabase/client";

/**
 * Base function to invoke a Supabase function with error handling and retry logic.
 */
export const invokeSupabaseFunction = async <T>(
  functionName: string,
  payload: object
): Promise<T> => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });
    
    if (error) {
      console.error(`Supabase function ${functionName} error:`, error);
      throw new Error(error.message);
    }
    
    return data as T;
  } catch (err: any) {
    console.error(`Failed to invoke Supabase function ${functionName}:`, err);
    throw err;
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

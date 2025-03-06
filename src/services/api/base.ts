
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Invoke a Supabase Edge Function with retry logic
 */
export async function invokeSupabaseFunction<T>(
  functionName: string,
  payload: any,
  retries: number = 2
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Invoking Supabase function: ${functionName} (attempt ${attempt + 1}/${retries + 1})`);
      
      const { data, error } = await supabase.functions.invoke<T>(functionName, {
        body: payload
      });
      
      if (error) {
        console.error(`Error invoking ${functionName}:`, error);
        lastError = new Error(`API error (${functionName}): ${error.message}`);
        
        // Wait before retrying with exponential backoff
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw lastError;
      }
      
      if (!data) {
        throw new Error(`No data returned from ${functionName}`);
      }
      
      return data as T;
    } catch (err) {
      console.error(`Error invoking ${functionName}:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // Wait before retrying with exponential backoff
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw lastError;
    }
  }
  
  // This should never happen due to the throws above, but TypeScript needs it
  throw lastError || new Error(`Failed to invoke ${functionName}`);
}

/**
 * Simple function to add retry capability to any async function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 2,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // Don't wait on the last attempt
      if (attempt < retries) {
        const delay = attempt === 0 ? retryDelay : Math.pow(2, attempt) * retryDelay;
        console.log(`Function failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("Function failed after retries");
}

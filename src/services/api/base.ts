
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { getWithCache, CACHE_EXPIRY } from "@/services/cache/cacheService";

/**
 * Invoke a Supabase Edge Function with retry logic and caching
 */
export async function invokeSupabaseFunction<T>(
  functionName: string,
  payload: any,
  options: {
    retries?: number;
    useCache?: boolean;
    cacheKey?: string;
    cacheTime?: number;
  } = {}
): Promise<T> {
  const {
    retries = 2,
    useCache = true,
    cacheKey = `func:${functionName}:${JSON.stringify(payload)}`,
    cacheTime = CACHE_EXPIRY.MEDIUM
  } = options;
  
  // If caching is enabled, try to get from cache first
  if (useCache) {
    try {
      const cachedData = await getWithCache<T>(
        cacheKey,
        () => _invokeWithRetries<T>(functionName, payload, retries),
        cacheTime
      );
      return cachedData;
    } catch (err) {
      console.error(`Cache error for ${functionName}, falling back to direct call:`, err);
      // If cache fails, fall back to direct invocation with retries
    }
  }
  
  // Direct invocation with retries
  return await _invokeWithRetries<T>(functionName, payload, retries);
}

/**
 * Internal helper function to invoke Edge Function with retries
 */
async function _invokeWithRetries<T>(
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
 * with improved error handling and logging
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    retries = 2,
    retryDelay = 1000,
    onRetry = (attempt, error) => console.log(`Retry attempt ${attempt} after error: ${error.message}`),
    shouldRetry = () => true
  } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}/${retries}`);
      }
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`Function failed (attempt ${attempt + 1}/${retries + 1}):`, lastError);
      
      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        console.log("Error not eligible for retry, giving up");
        throw lastError;
      }
      
      // Don't wait on the last attempt
      if (attempt < retries) {
        const delay = attempt === 0 ? retryDelay : Math.pow(2, attempt) * retryDelay;
        console.log(`Waiting ${delay}ms before retry...`);
        onRetry(attempt + 1, lastError);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("Function failed after retries");
}

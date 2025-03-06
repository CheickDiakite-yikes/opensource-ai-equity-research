
import { supabase } from "@/integrations/supabase/client";

/**
 * Invoke a Supabase Edge Function
 */
export const invokeSupabaseFunction = async <T>(
  functionName: string, 
  payload?: any
): Promise<T> => {
  try {
    console.log(`Invoking Supabase function: ${functionName} with payload:`, payload);
    
    const { data, error } = await supabase.functions.invoke<T>(functionName, {
      body: payload,
    });
    
    if (error) {
      console.error(`Error invoking ${functionName}:`, error);
      throw error;
    }
    
    if (!data) {
      console.warn(`No data returned from ${functionName}`);
      throw new Error(`No data returned from ${functionName}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error invoking Supabase function ${functionName}:`, error);
    throw error;
  }
};

/**
 * Generic API fetch function
 */
export const fetchFromAPI = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`Error fetching from API (${endpoint}):`, error);
    throw error;
  }
};

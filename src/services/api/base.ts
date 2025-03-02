
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
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });

    if (error) throw new Error(error.message);
    return data as T;
  } catch (error) {
    console.error(`Error invoking ${functionName}:`, error);
    toast({
      title: "Error",
      description: `API Error: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

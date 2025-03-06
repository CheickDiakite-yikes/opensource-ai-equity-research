
import { DCFInputs, CustomDCFResult } from "@/types/ai-analysis/dcfTypes";
import { supabase } from "@/integrations/supabase/client";

export const calculateCustomDCF = async (symbol: string, customInputs?: Partial<DCFInputs>): Promise<Response> => {
  try {
    // First, check if we have a cached result in Supabase
    const cacheKey = `dcf:${symbol}:${JSON.stringify(customInputs || {})}`;
    
    try {
      const { data: cachedResult, error: cacheError } = await supabase
        .from('api_cache')
        .select('data')
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      
      if (!cacheError && cachedResult?.data) {
        console.log(`Using cached DCF calculation for ${symbol}`);
        
        // Return cached data with the mock header to indicate it's from cache
        return new Response(JSON.stringify(cachedResult.data), {
          headers: { 'Content-Type': 'application/json', 'X-Cache-Hit': 'true' }
        });
      }
    } catch (cacheErr) {
      console.error("Error checking DCF cache:", cacheErr);
      // Continue with fresh calculation
    }
    
    // Call the Supabase Edge Function directly
    const { data, error } = await supabase.functions.invoke('get-custom-dcf', {
      body: { 
        symbol, 
        params: customInputs || {},
        type: customInputs ? 'advanced' : 'standard'
      }
    });
    
    if (error) {
      console.error("Error calling DCF function:", error);
      throw new Error(`DCF calculation failed: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("Empty response from DCF calculation");
    }
    
    // Cache the successful result in Supabase for future requests
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Cache for 24 hours
      
      const { error: insertError } = await supabase
        .from('api_cache')
        .upsert({
          cache_key: cacheKey,
          data: data,
          expires_at: expiresAt.toISOString(),
          metadata: { 
            symbol,
            customInputs: customInputs || {},
            fetched_at: new Date().toISOString(),
            is_mock: false
          }
        }, { onConflict: 'cache_key' });
      
      if (insertError) {
        console.error("Error caching DCF result:", insertError);
      }
    } catch (cacheErr) {
      console.error("Error caching DCF result:", cacheErr);
    }
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'X-Mock-Data': 'false'
      }
    });
  } catch (error) {
    console.error("Error calculating DCF:", error);
    
    // Create a mock response with error details
    const mockResponse = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      mockData: true
    };
    
    // Return as a Response object
    return new Response(JSON.stringify(mockResponse), {
      headers: { 'Content-Type': 'application/json', 'X-Mock-Data': 'true' }
    });
  }
};

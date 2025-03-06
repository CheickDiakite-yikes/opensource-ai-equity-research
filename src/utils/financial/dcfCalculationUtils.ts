
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
    
    // Prepare the API request parameters
    const params = new URLSearchParams();
    params.append('symbol', symbol);
    
    // Add custom inputs if provided, with proper parameter naming for the FMP API
    if (customInputs) {
      // Map our internal property names to the expected FMP API parameter names
      const parameterMap: Record<string, string> = {
        revenuePercentage: 'revenueGrowth',
        ebitdaPercentage: 'ebitdaMargin',
        capitalExpenditurePercentage: 'capexPercent',
        taxRate: 'taxRate',
        longTermGrowthRate: 'longTermGrowthRate',
        costOfEquity: 'costOfEquity',
        costOfDebt: 'costofDebt', // Note: FMP API uses lowercase 'of' here
        marketRiskPremium: 'marketRiskPremium',
        riskFreeRate: 'riskFreeRate',
        beta: 'beta'
      };
      
      Object.entries(customInputs).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Use the mapped parameter name if available, otherwise use the original key
          const paramName = parameterMap[key] || key;
          
          // Convert any percentage inputs from whole numbers to decimals if needed
          let paramValue = value;
          if (key === 'longTermGrowthRate' || key === 'costOfEquity' || 
              key === 'costOfDebt' || key === 'marketRiskPremium' || 
              key === 'riskFreeRate') {
            // Check if it's a percentage value (e.g., 3.5 for 3.5%)
            if (typeof value === 'number' && value > 0.2) {
              paramValue = value / 100;
              console.log(`Converting ${key} from ${value} to ${paramValue}`);
            }
          }
          
          params.append(paramName, paramValue.toString());
        }
      });
    }
    
    // Call the DCF API endpoint through our Supabase Edge Function
    const apiUrl = `/api/dcf?${params.toString()}`;
    console.log("Calling DCF API with params:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DCF calculation failed with status: ${response.status}, Error: ${errorText}`);
      throw new Error(`DCF calculation failed with status: ${response.status}`);
    }
    
    // Check if we received mock data
    const isMockData = response.headers.get('X-Mock-Data') === 'true';
    if (isMockData) {
      console.log('Using mock DCF data due to API limitations');
    }
    
    // Get the JSON data
    const data = await response.json();
    
    // Cache the successful result in Supabase for future requests
    if (!isMockData && data) {
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
    }
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'X-Mock-Data': isMockData ? 'true' : 'false'
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

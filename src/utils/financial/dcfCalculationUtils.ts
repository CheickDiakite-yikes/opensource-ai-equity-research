
import { DCFInputs, CustomDCFResult } from "@/types/ai-analysis/dcfTypes";

export const calculateCustomDCF = async (symbol: string, customInputs?: Partial<DCFInputs>): Promise<Response> => {
  try {
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
        costOfDebt: 'costOfDebt',
        marketRiskPremium: 'marketRiskPremium',
        riskFreeRate: 'riskFreeRate',
        beta: 'beta'
      };
      
      Object.entries(customInputs).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Use the mapped parameter name if available, otherwise use the original key
          const paramName = parameterMap[key] || key;
          params.append(paramName, value.toString());
        }
      });
    }
    
    // Log the DCF API request parameters for debugging
    console.log("DCF API Request Params:", Object.fromEntries(params.entries()));
    
    // Call the DCF API endpoint - first try the API route
    let apiUrl = `/api/dcf?${params.toString()}`;
    console.log("Calling DCF API with URL:", apiUrl);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`API route returned status: ${response.status}`);
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
        
        if (response.status === 404) {
          // If the API route returns 404, try the edge function directly
          console.log("API route not found, trying Supabase Edge Function directly");
          throw new Error("API route not found");
        }
        
        throw new Error(`DCF calculation failed with status: ${response.status}, Error: ${errorText}`);
      }
      
      // Log success if the API worked
      console.log("DCF API call successful");
      return response;
    } catch (err) {
      // If using the API route failed, try calling the Supabase Edge Function directly
      console.log("API route failed, trying direct Supabase Edge Function call");
      
      // Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Call the Supabase Edge Function directly with formatted parameters
      const paramObject = Object.fromEntries(params);
      console.log("Calling Supabase Edge Function with params:", paramObject);
      
      const { data, error } = await supabase.functions.invoke('get-custom-dcf', {
        body: {
          symbol,
          params: paramObject,
          type: "advanced"
        }
      });
      
      if (error) {
        console.error("Error calling Supabase Edge Function:", error);
        throw new Error(`Supabase function error: ${error.message}`);
      }
      
      console.log("Supabase Edge Function response:", data);
      
      // Return a mock Response object with the data
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }
  } catch (error) {
    console.error("Error calculating DCF:", error);
    // Return an error response so we can handle it gracefully
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      detail: "Failed to calculate DCF values"
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
};

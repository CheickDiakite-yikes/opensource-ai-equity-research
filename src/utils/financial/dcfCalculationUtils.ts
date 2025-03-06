
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
        revenuePercentage: 'revenueGrowthPct',
        ebitdaPercentage: 'ebitdaPct',
        capitalExpenditurePercentage: 'capitalExpenditurePct',
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
    
    // Call the DCF API endpoint - first try the API route
    let apiUrl = `/api/dcf?${params.toString()}`;
    console.log("Calling DCF API with params:", apiUrl);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // If the API route returns 404, try the edge function directly
          console.log("API route not found, trying Supabase Edge Function directly");
          throw new Error("API route not found");
        }
        
        const errorText = await response.text();
        console.error(`DCF calculation failed with status: ${response.status}, Error: ${errorText}`);
        throw new Error(`DCF calculation failed with status: ${response.status}`);
      }
      
      return response;
    } catch (err) {
      // If using the API route failed, try calling the Supabase Edge Function directly
      if (err instanceof Error && (err.message.includes("404") || err.message.includes("not found"))) {
        console.log("Trying direct Supabase Edge Function call to get-custom-dcf");
        
        // Import supabase client
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Call the Supabase Edge Function directly
        const { data, error } = await supabase.functions.invoke('get-custom-dcf', {
          body: {
            symbol,
            params: Object.fromEntries(params),
            type: "advanced"
          }
        });
        
        if (error) {
          console.error("Error calling Supabase Edge Function:", error);
          throw new Error(`Supabase function error: ${error.message}`);
        }
        
        // Return a mock Response object with the data
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Re-throw the original error if it wasn't a 404
      throw err;
    }
  } catch (error) {
    console.error("Error calculating DCF:", error);
    throw error;
  }
};

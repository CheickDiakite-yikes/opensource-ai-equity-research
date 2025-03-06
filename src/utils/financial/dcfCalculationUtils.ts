
import { DCFInputs, CustomDCFResult } from "@/types/ai-analysis/dcfTypes";

export const calculateCustomDCF = async (symbol: string, customInputs?: Partial<DCFInputs>): Promise<Response> => {
  try {
    // Prepare the API request parameters
    const params = new URLSearchParams();
    params.append('symbol', symbol);
    
    // Add custom inputs if provided
    if (customInputs) {
      Object.entries(customInputs).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    // Call the DCF API endpoint
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
    
    return response;
  } catch (error) {
    console.error("Error calculating DCF:", error);
    throw error;
  }
};

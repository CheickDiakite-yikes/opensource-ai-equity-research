
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
    const response = await fetch(`/api/dcf?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`DCF calculation failed with status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error("Error calculating DCF:", error);
    throw error;
  }
};

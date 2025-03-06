
import { CustomDCFParams, CustomDCFResult } from "@/types/ai-analysis/dcfTypes";

// This file serves as a proxy to the Supabase Edge Function for calculating DCF values
export async function calculateDCF(
  symbol: string, 
  params: Partial<CustomDCFParams> = {}
): Promise<CustomDCFResult> {
  try {
    // Format parameters for the API request
    const urlParams = new URLSearchParams();
    urlParams.append('symbol', symbol);
    
    // Add any provided custom parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlParams.append(key, value.toString());
      }
    });
    
    // Use the Supabase edge function
    const response = await fetch(`/api/dcf?${urlParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DCF calculation failed: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract first item if it's an array
    const result = Array.isArray(data) && data.length > 0 ? data[0] : data;
    
    return result as CustomDCFResult;
  } catch (error) {
    console.error('Error calculating DCF:', error);
    throw error;
  }
}

// Exporting a proxy API for the frontend
export default {
  calculateDCF
};

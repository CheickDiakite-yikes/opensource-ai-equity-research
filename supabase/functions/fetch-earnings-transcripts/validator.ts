
/**
 * Validates the request parameters for the fetch-earnings-transcripts function
 */
export function validateRequest(requestData: any): { 
  symbol?: string; 
  limit?: number; 
  quarter?: string; 
  year?: string; 
  validationError?: string;
} {
  try {
    const { symbol, limit, quarter, year } = requestData;
    
    if (!symbol) {
      return {
        validationError: "Symbol is required"
      };
    }
    
    // Return validated parameters
    return { 
      symbol, 
      limit: limit ? Number(limit) : undefined, 
      quarter, 
      year 
    };
  } catch (error) {
    return {
      validationError: `Invalid request format: ${error.message}`
    };
  }
}

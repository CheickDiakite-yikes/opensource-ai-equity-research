
/**
 * Validates the incoming request for the cache-company-documents function
 */
export async function validateRequest(req: Request): Promise<{ 
  symbol?: string; 
  docType?: "transcripts" | "filings" | "all"; 
  validationError?: string;
}> {
  try {
    const { symbol, docType } = await req.json();
    
    if (!symbol) {
      return {
        validationError: "Symbol is required"
      };
    }
    
    if (!docType || !["transcripts", "filings", "all"].includes(docType)) {
      return {
        validationError: "Valid docType is required (transcripts, filings, or all)"
      };
    }
    
    return { symbol, docType: docType as "transcripts" | "filings" | "all" };
  } catch (error) {
    return {
      validationError: `Invalid request format: ${error.message}`
    };
  }
}

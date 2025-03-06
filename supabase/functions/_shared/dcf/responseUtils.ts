
import { corsHeaders } from "../cors.ts";

// Cache-control headers (per DCF type)
export const getCacheHeaders = (type: string) => {
  let maxAge = 3600; // Default 1 hour cache
  
  // Custom DCF types that use user-defined parameters shouldn't be cached as long
  if (type === 'custom-levered' || type === 'advanced') {
    maxAge = 300; // 5 minutes for custom DCF calculations
  }
  
  return {
    'Cache-Control': `public, max-age=${maxAge}`,
    'Vary': 'Origin, Accept-Encoding',
  };
};

// Process and enhance DCF data for custom types
export const enhanceCustomDCFData = (data: any[], type: string): any[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return data;
  }
  
  // For custom DCF types, ensure we update the free cash flow values
  if (type === 'advanced' || type === 'custom-levered') {
    data.forEach(item => {
      // Set explicit free cash flow if missing
      if (item.freeCashFlow === undefined && item.operatingCashFlow !== undefined) {
        const operatingCashFlow = item.operatingCashFlow || 0;
        const capitalExpenditure = item.capitalExpenditure || 0;
        item.freeCashFlow = operatingCashFlow - Math.abs(capitalExpenditure);
      }
      
      // Ensure equityValuePerShare is set
      if (item.equityValuePerShare === undefined && item.equityValue !== undefined && item.dilutedSharesOutstanding) {
        item.equityValuePerShare = item.equityValue / item.dilutedSharesOutstanding;
      }
    });
  }
  
  return data;
};

// Create a standard response with appropriate headers
export const createJsonResponse = (data: any, type: string): Response => {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        ...getCacheHeaders(type)
      } 
    }
  );
};

// Create an error response
export const createErrorResponse = (error: string, details: string, status: number): Response => {
  return new Response(
    JSON.stringify({ error, details }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status 
    }
  );
};

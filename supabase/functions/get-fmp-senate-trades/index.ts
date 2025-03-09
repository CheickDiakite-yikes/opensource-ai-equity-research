
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { FMP_API_KEY } from "../_shared/constants.ts";
import { createResponse, createErrorResponse, makeApiRequest } from "../_shared/api-utils.ts";

interface SenateTrade {
  symbol: string;
  disclosureDate: string;
  transactionDate: string;
  firstName: string;
  lastName: string;
  office: string;
  district: string;
  owner: string;
  assetDescription: string;
  assetType: string;
  type: string;
  amount: string;
  comment: string;
  link: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, page = 0, limit = 100 } = await req.json();
    
    console.log(`Fetching U.S. Senate Trades data for symbol: ${symbol}`);
    
    // Build the URL with parameters
    const url = `https://financialmodelingprep.com/api/v3/senate-trading${symbol ? `?symbol=${symbol}&` : '?'}page=${page}&limit=${limit}&apikey=${FMP_API_KEY}`;
    console.log(`Making request to FMP API: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
    
    try {
      const data = await makeApiRequest<SenateTrade[]>(url, "Failed to fetch Senate Trades data");
      
      console.log(`Received Senate Trades data. Data length: ${data?.length || 0}`);
      
      if (!data || data.length === 0) {
        console.log(`No Senate Trades data available${symbol ? ` for ${symbol}` : ''}`);
        return createResponse({
          symbol: symbol || '',
          data: [],
          message: `No U.S. Senate Trades data available${symbol ? ` for ${symbol}` : ''}`,
          source: "fmp"
        });
      }
      
      // Transform the data to match our CongressionalTrade type
      const transformedData = data.map(trade => ({
        // Map properties to match our CongressionalTrade type
        amountFrom: parseAmountFrom(trade.amount),
        amountTo: parseAmountTo(trade.amount),
        assetName: trade.assetDescription,
        filingDate: trade.disclosureDate,
        name: `${trade.firstName} ${trade.lastName}`,
        ownerType: trade.owner,
        position: `${trade.office} ${trade.district ? trade.district : ''}`.trim(),
        symbol: trade.symbol,
        transactionDate: trade.transactionDate,
        transactionType: trade.type === "Sale" ? "Sale" : "Purchase",
        // Additional FMP-specific data
        link: trade.link,
        comment: trade.comment,
        source: "fmp" as const
      }));
      
      console.log(`Transformed ${transformedData.length} Senate Trades records`);
      
      return createResponse({
        symbol: symbol || '',
        data: transformedData,
        source: "fmp"
      });
      
    } catch (apiError) {
      console.error(`FMP API error for Senate Trades data:`, apiError);
      return createErrorResponse(new Error(`Failed to fetch Senate Trades data: ${apiError.message}`));
    }
  } catch (error) {
    console.error("Error in get-fmp-senate-trades:", error);
    return createErrorResponse(new Error(`Server error processing Senate Trades request: ${error.message}`));
  }
});

// Helper functions to parse amount ranges from FMP format
function parseAmountFrom(amountString: string): number {
  if (!amountString) return 0;
  
  try {
    // Handle ranges like "$15,001 - $50,000"
    const match = amountString.match(/\$([0-9,]+)/);
    if (match && match[1]) {
      return Number(match[1].replace(/,/g, ''));
    }
    
    // Handle exact amounts
    if (amountString.startsWith('$')) {
      return Number(amountString.substring(1).replace(/,/g, ''));
    }
    
    return 0;
  } catch (e) {
    console.error("Error parsing amount:", e);
    return 0;
  }
}

function parseAmountTo(amountString: string): number {
  if (!amountString) return 0;
  
  try {
    // Extract the upper range if exists
    const match = amountString.match(/- \$([0-9,]+)/);
    if (match && match[1]) {
      return Number(match[1].replace(/,/g, ''));
    }
    
    // If no range, use the first amount
    return parseAmountFrom(amountString);
  } catch (e) {
    console.error("Error parsing amount:", e);
    return 0;
  }
}

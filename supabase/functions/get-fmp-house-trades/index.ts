
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { FMP_API_KEY } from "../_shared/constants.ts";
import { createResponse, createErrorResponse, makeApiRequest } from "../_shared/api-utils.ts";

interface HouseTrade {
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
  capitalGainsOver200USD: string;
  comment: string;
  link: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    
    if (!symbol) {
      return createErrorResponse(new Error("Symbol is required"), 400);
    }

    console.log(`Fetching U.S. House Trades data for symbol: ${symbol}`);
    
    const url = `https://financialmodelingprep.com/api/v3/stock/house-trading?symbol=${symbol}&apikey=${FMP_API_KEY}`;
    
    try {
      const data = await makeApiRequest<HouseTrade[]>(url, "Failed to fetch House Trades data");
      
      console.log(`Received House Trades data for ${symbol}. Data length: ${data?.length || 0}`);
      
      if (!data || data.length === 0) {
        console.log(`No House Trades data available for ${symbol}`);
        return createResponse({
          symbol,
          data: [],
          message: `No U.S. House Trades data available for ${symbol}`
        });
      }
      
      // Transform the data to match our application's format
      const transformedData = data.map(trade => ({
        // Map properties to match our CongressionalTrade type
        amountFrom: parseAmountFrom(trade.amount),
        amountTo: parseAmountTo(trade.amount),
        assetName: trade.assetDescription,
        filingDate: trade.disclosureDate,
        name: `${trade.firstName} ${trade.lastName}`,
        ownerType: trade.owner,
        position: `${trade.office} ${trade.district}`.trim(),
        symbol: trade.symbol,
        transactionDate: trade.transactionDate,
        transactionType: trade.type === "Sale" ? "Sale" : "Purchase",
        // Additional FMP-specific data
        link: trade.link,
        comment: trade.comment,
        source: "fmp" as const
      }));
      
      return createResponse({
        symbol,
        data: transformedData,
        source: "fmp"
      });
      
    } catch (apiError) {
      console.error(`FMP API error for House Trades data (${symbol}):`, apiError);
      return createErrorResponse(new Error(`Failed to fetch House Trades data: ${apiError.message}`));
    }
  } catch (error) {
    console.error("Error in get-fmp-house-trades:", error);
    return createErrorResponse(new Error(`Server error processing House Trades request: ${error.message}`));
  }
});

// Helper functions to parse amount ranges from FMP format
function parseAmountFrom(amountString: string): number {
  if (!amountString) return 0;
  
  // Extract the lower range from strings like "$10,000,001 - $25,000,000"
  const match = amountString.match(/\$([0-9,]+)/);
  if (match && match[1]) {
    return Number(match[1].replace(/,/g, ''));
  }
  return 0;
}

function parseAmountTo(amountString: string): number {
  if (!amountString) return 0;
  
  // Extract the upper range if exists
  const match = amountString.match(/- \$([0-9,]+)/);
  if (match && match[1]) {
    return Number(match[1].replace(/,/g, ''));
  }
  
  // If no range, use the first amount
  return parseAmountFrom(amountString);
}


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildFmpQueryUrl, makeApiRequest, handleApiResponse, createResponse, createErrorResponse } from "../_shared/api-utils.ts";

interface InsiderTradingRequest {
  symbol: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request data
    const { symbol } = await req.json() as InsiderTradingRequest;
    
    if (!symbol) {
      return createErrorResponse(new Error("Symbol is required"), 400);
    }
    
    console.log(`Fetching insider trading statistics for ${symbol}`);
    
    // Build the API URL for insider trading statistics
    const url = buildFmpQueryUrl("insider-trading-transactions", symbol, {
      limit: "100"
    });
    
    // Fetch data from FMP
    const data = await makeApiRequest(url, `Failed to fetch insider trading statistics for ${symbol}`);
    
    // If data is null or empty, try alternative API endpoint
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log(`No results from insider-trading-transactions, trying insider/trading endpoint for ${symbol}`);
      
      // Try the alternative endpoint
      const altUrl = buildFmpQueryUrl("insider/trading", symbol, {
        limit: "100"
      });
      
      const altData = await makeApiRequest(altUrl, `Failed to fetch insider trading statistics for ${symbol}`);
      
      // Validate the alternative response
      const validatedAltData = handleApiResponse(altData, `No insider trading statistics found for ${symbol}`);
      
      // Process the data to summarize trading stats by quarter
      const processedData = processInsiderTradingData(validatedAltData);
      
      console.log(`Successfully fetched and processed alternative insider trading statistics for ${symbol}`);
      
      return createResponse({
        symbol,
        tradingStats: processedData
      });
    }
    
    // Validate the response from the first endpoint
    const validatedData = handleApiResponse(data, `No insider trading statistics found for ${symbol}`);
    
    // Process the data to summarize trading stats by quarter
    const processedData = processInsiderTradingData(validatedData);
    
    console.log(`Successfully fetched and processed insider trading statistics for ${symbol}`);
    
    return createResponse({
      symbol,
      tradingStats: processedData
    });
  } catch (error) {
    console.error("Error in get-fmp-insider-trading-stats:", error);
    return createErrorResponse(error, 500);
  }
});

/**
 * Process insider trading data to create summarized statistics by quarter
 */
function processInsiderTradingData(data: any[]): any[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  // Group transactions by year and quarter
  const groupedByQuarter = data.reduce((acc, transaction) => {
    // Extract year and determine quarter from transaction date
    const transactionDate = new Date(transaction.transactionDate);
    const year = transactionDate.getFullYear();
    const month = transactionDate.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    
    const key = `${year}-${quarter}`;
    
    if (!acc[key]) {
      acc[key] = {
        year,
        quarter,
        acquiredTransactions: 0,
        disposedTransactions: 0,
        totalAcquired: 0,
        totalDisposed: 0,
        transactions: []
      };
    }
    
    // Push transaction to the corresponding quarter
    acc[key].transactions.push(transaction);
    
    // Update counters based on transaction type
    const transactionType = transaction.transactionType || '';
    const transactionAmount = parseInt(transaction.transactionAmount || 0, 10);
    
    if (transactionType.toUpperCase().includes('BUY') || 
        transactionType.toUpperCase().includes('ACQUIRE') || 
        transactionType.toUpperCase().includes('PURCHASE')) {
      acc[key].acquiredTransactions++;
      acc[key].totalAcquired += transactionAmount;
    } else if (transactionType.toUpperCase().includes('SELL') || 
              transactionType.toUpperCase().includes('DISPOSE') || 
              transactionType.toUpperCase().includes('SALE')) {
      acc[key].disposedTransactions++;
      acc[key].totalDisposed += transactionAmount;
    }
    
    return acc;
  }, {} as Record<string, any>);
  
  // Convert grouped data to array and calculate additional metrics
  const stats = Object.values(groupedByQuarter).map(quarterData => {
    const {
      year,
      quarter,
      acquiredTransactions,
      disposedTransactions,
      totalAcquired,
      totalDisposed,
      transactions
    } = quarterData;
    
    // Calculate derived metrics
    const acquiredDisposedRatio = disposedTransactions > 0 
      ? acquiredTransactions / disposedTransactions 
      : acquiredTransactions > 0 ? 999 : 0;
    
    const averageAcquired = acquiredTransactions > 0 
      ? totalAcquired / acquiredTransactions 
      : 0;
    
    const averageDisposed = disposedTransactions > 0 
      ? totalDisposed / disposedTransactions 
      : 0;
    
    // Find CIK from the first transaction (should be consistent)
    const cik = transactions[0]?.reportingCik || '';
    
    // Extract purchase and sale counts
    const totalPurchases = acquiredTransactions;
    const totalSales = disposedTransactions;
    
    return {
      symbol: transactions[0]?.symbol || '',
      cik,
      year,
      quarter,
      acquiredTransactions,
      disposedTransactions,
      acquiredDisposedRatio,
      totalAcquired,
      totalDisposed,
      averageAcquired,
      averageDisposed,
      totalPurchases,
      totalSales
    };
  });
  
  // Sort by year and quarter (newest first)
  return stats.sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return b.quarter - a.quarter;
  });
}

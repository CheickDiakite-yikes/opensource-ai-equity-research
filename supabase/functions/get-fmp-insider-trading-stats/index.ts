
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
    
    // Try to fetch data from multiple endpoints with fallbacks
    let data;
    let errorMessage = "";
    
    try {
      // First try the transactions-by-symbol endpoint (newer API)
      console.log(`Trying primary endpoint: insider-trading-transactions-by-symbol for ${symbol}`);
      const url = buildFmpQueryUrl("insider-trading-transactions-by-symbol", symbol, {
        limit: "100"
      });
      data = await makeApiRequest(url);
      console.log(`Got response from primary endpoint with ${Array.isArray(data) ? data.length : 0} items`);
    } catch (primaryError) {
      console.error(`Error from primary endpoint: ${primaryError.message}`);
      errorMessage += `Primary endpoint error: ${primaryError.message}. `;
      
      try {
        // Try insider-trading-transactions
        console.log(`Trying secondary endpoint: insider-trading-transactions for ${symbol}`);
        const backupUrl = buildFmpQueryUrl("insider-trading-transactions", symbol, {
          limit: "100"
        });
        data = await makeApiRequest(backupUrl);
        console.log(`Got response from secondary endpoint with ${Array.isArray(data) ? data.length : 0} items`);
      } catch (secondaryError) {
        console.error(`Error from secondary endpoint: ${secondaryError.message}`);
        errorMessage += `Secondary endpoint error: ${secondaryError.message}. `;
        
        try {
          // Try basic insider/trading as a last resort
          console.log(`Trying fallback endpoint: insider/trading for ${symbol}`);
          const fallbackUrl = buildFmpQueryUrl("insider/trading", symbol, {
            limit: "100"
          });
          data = await makeApiRequest(fallbackUrl);
          console.log(`Got response from fallback endpoint with ${Array.isArray(data) ? data.length : 0} items`);
        } catch (fallbackError) {
          console.error(`Error from fallback endpoint: ${fallbackError.message}`);
          errorMessage += `Fallback endpoint error: ${fallbackError.message}`;
          // Let this one bubble up since it's our last try
          throw new Error(`All insider trading endpoints failed: ${errorMessage}`);
        }
      }
    }
    
    // Check if we have valid data
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log(`No insider trading data found for ${symbol} after trying all endpoints`);
      throw new Error(`No insider trading data available for ${symbol}`);
    }
    
    // Process the data
    const processedData = processInsiderTradingData(data);
    
    if (processedData.length === 0) {
      console.log(`No valid insider trading data could be processed for ${symbol}`);
      throw new Error(`No insider trading data could be processed for ${symbol}`);
    }
    
    console.log(`Successfully processed ${processedData.length} quarters of insider trading data for ${symbol}`);
    
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
  
  console.log(`Processing ${data.length} insider trading transactions`);
  
  // Define a sample structure to understand data format
  const sampleTransaction = data[0];
  console.log("Sample transaction structure:", JSON.stringify(sampleTransaction, null, 2).substring(0, 500) + "...");
  
  // Group transactions by year and quarter
  const groupedByQuarter = data.reduce((acc, transaction) => {
    // Extract date from the transaction
    let transactionDate;
    if (transaction.transactionDate) {
      transactionDate = new Date(transaction.transactionDate);
    } else if (transaction.filingDate) {
      transactionDate = new Date(transaction.filingDate);
    } else if (transaction.date) {
      transactionDate = new Date(transaction.date);
    } else {
      console.log(`Skipping transaction with no date:`, JSON.stringify(transaction).substring(0, 100));
      return acc; // Skip this transaction
    }
    
    // Extract year and determine quarter
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
    
    // Determine transaction type and amount
    let isAcquisition = false;
    let isDisposal = false;
    let transactionAmount = 0;
    
    // Different APIs use different field names
    const transactionType = transaction.transactionType || 
                           transaction.type || 
                           transaction.acquistionOrDisposition || 
                           '';
    
    // Parse transaction amount from different possible fields
    if (transaction.transactionAmount !== undefined && transaction.transactionAmount !== null) {
      transactionAmount = parseInt(transaction.transactionAmount, 10) || 0;
    } else if (transaction.securitiesTransacted !== undefined && transaction.securitiesTransacted !== null) {
      transactionAmount = parseInt(transaction.securitiesTransacted, 10) || 0;
    } else if (transaction.share !== undefined && transaction.share !== null) {
      transactionAmount = parseInt(transaction.share, 10) || 0;
    } else if (transaction.numberOfShares !== undefined && transaction.numberOfShares !== null) {
      transactionAmount = parseInt(transaction.numberOfShares, 10) || 0;
    } else if (transaction.shares !== undefined && transaction.shares !== null) {
      transactionAmount = parseInt(transaction.shares, 10) || 0;
    } else {
      transactionAmount = 0;
    }
    
    // Normalize transaction type to determine if it's a buy or sell
    const typeUpper = transactionType.toUpperCase();
    
    if (typeUpper.includes('BUY') || 
        typeUpper.includes('ACQUIRE') || 
        typeUpper.includes('PURCHASE') ||
        typeUpper === 'A' ||
        typeUpper.includes('GRANT') ||
        typeUpper.includes('AWARD')) {
      isAcquisition = true;
      acc[key].acquiredTransactions++;
      acc[key].totalAcquired += transactionAmount;
    } else if (typeUpper.includes('SELL') || 
              typeUpper.includes('DISPOSE') || 
              typeUpper.includes('SALE') ||
              typeUpper === 'D' ||
              typeUpper.includes('TRANSFER')) {
      isDisposal = true;
      acc[key].disposedTransactions++;
      acc[key].totalDisposed += transactionAmount;
    } else {
      console.log(`Unknown transaction type: ${transactionType}`);
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
    
    // Find CIK or other identifiers from the first transaction
    let cik = '';
    if (transactions.length > 0) {
      cik = transactions[0].reportingCik || 
            transactions[0].cik || 
            transactions[0].reportingPersonId || 
            '';
    }
    
    // Extract purchase and sale counts
    const totalPurchases = acquiredTransactions;
    const totalSales = disposedTransactions;
    
    const symbol = transactions.length > 0 ? 
                  transactions[0].symbol || 
                  transactions[0].ticker || 
                  '' : '';
    
    return {
      symbol,
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


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildFmpQueryUrl, makeApiRequest, createResponse, createErrorResponse } from "../_shared/api-utils.ts";

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
    
    // Try to fetch data with better error handling
    let data = [];
    let errorMessages = [];
    
    // Attempt to get data from first endpoint
    try {
      console.log(`Trying insider-trading endpoint for ${symbol}`);
      const url = buildFmpQueryUrl("insider-trading", symbol, {
        limit: "100"
      });
      const response = await makeApiRequest(url);
      
      if (Array.isArray(response) && response.length > 0) {
        console.log(`Successfully retrieved ${response.length} insider trading records from primary endpoint`);
        data = response;
      } else {
        console.log("Empty response from primary endpoint, will try alternative endpoint");
        errorMessages.push("Primary endpoint returned empty data");
      }
    } catch (error) {
      console.error(`Error fetching from primary endpoint: ${error.message}`);
      errorMessages.push(`Primary endpoint error: ${error.message}`);
      
      // Try alternative endpoint
      try {
        console.log(`Trying insider-trading-transactions endpoint for ${symbol}`);
        const backupUrl = buildFmpQueryUrl("insider-trading-transactions", symbol, {
          limit: "100"
        });
        const response = await makeApiRequest(backupUrl);
        
        if (Array.isArray(response) && response.length > 0) {
          console.log(`Successfully retrieved ${response.length} insider trading records from secondary endpoint`);
          data = response;
        } else {
          console.log("Empty response from secondary endpoint");
          errorMessages.push("Secondary endpoint returned empty data");
        }
      } catch (secondaryError) {
        console.error(`Error fetching from secondary endpoint: ${secondaryError.message}`);
        errorMessages.push(`Secondary endpoint error: ${secondaryError.message}`);
      }
    }
    
    // Return error if no data was found
    if (!data || data.length === 0) {
      console.error(`No insider trading data found for ${symbol} after trying multiple endpoints`);
      return createErrorResponse(
        new Error(`No insider trading data available for ${symbol}: ${errorMessages.join(", ")}`), 
        404
      );
    }
    
    // Process the data
    console.log(`Processing ${data.length} insider trading records`);
    const processedData = processInsiderTradingData(data);
    
    if (!processedData || processedData.length === 0) {
      console.error(`Could not process insider trading data for ${symbol}`);
      return createErrorResponse(
        new Error(`Could not process insider trading data for ${symbol}`), 
        500
      );
    }
    
    console.log(`Successfully processed ${processedData.length} quarters of insider trading data`);
    
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
function processInsiderTradingData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  console.log(`Processing ${data.length} insider trading transactions`);
  
  // Log a sample transaction to understand the structure
  const sampleTransaction = data[0];
  console.log("Sample transaction:", JSON.stringify(sampleTransaction).substring(0, 500));
  
  // Group transactions by year and quarter
  const groupedByQuarter = {};
  
  for (const transaction of data) {
    // Skip invalid transactions
    if (!transaction) continue;
    
    // Extract date from the transaction using various possible field names
    let transactionDate;
    if (transaction.transactionDate) {
      transactionDate = new Date(transaction.transactionDate);
    } else if (transaction.filingDate) {
      transactionDate = new Date(transaction.filingDate);
    } else if (transaction.date) {
      transactionDate = new Date(transaction.date);
    } else {
      console.log(`Skipping transaction with no date:`, JSON.stringify(transaction).substring(0, 200));
      continue; // Skip this transaction
    }
    
    // Validate date
    if (isNaN(transactionDate.getTime())) {
      console.log(`Invalid date in transaction:`, JSON.stringify(transaction).substring(0, 200));
      continue;
    }
    
    // Extract year and determine quarter
    const year = transactionDate.getFullYear();
    const month = transactionDate.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    
    const key = `${year}-${quarter}`;
    
    // Initialize the quarter data if it doesn't exist
    if (!groupedByQuarter[key]) {
      groupedByQuarter[key] = {
        year,
        quarter,
        acquiredTransactions: 0,
        disposedTransactions: 0,
        totalAcquired: 0,
        totalDisposed: 0,
        transactions: []
      };
    }
    
    // Add transaction to the quarter
    groupedByQuarter[key].transactions.push(transaction);
    
    // Determine transaction type (buy/sell) and extract amount
    let transactionType = '';
    let transactionAmount = 0;
    
    // Extract type from multiple possible fields
    if (transaction.transactionType) {
      transactionType = transaction.transactionType;
    } else if (transaction.type) {
      transactionType = transaction.type;
    } else if (transaction.acquistionOrDisposition) {
      transactionType = transaction.acquistionOrDisposition;
    }
    
    // Extract amount from multiple possible fields
    if (transaction.transactionAmount !== undefined && transaction.transactionAmount !== null) {
      transactionAmount = parseFloat(transaction.transactionAmount) || 0;
    } else if (transaction.securitiesTransacted !== undefined && transaction.securitiesTransacted !== null) {
      transactionAmount = parseFloat(transaction.securitiesTransacted) || 0;
    } else if (transaction.share !== undefined && transaction.share !== null) {
      transactionAmount = parseFloat(transaction.share) || 0;
    } else if (transaction.numberOfShares !== undefined && transaction.numberOfShares !== null) {
      transactionAmount = parseFloat(transaction.numberOfShares) || 0;
    } else if (transaction.shares !== undefined && transaction.shares !== null) {
      transactionAmount = parseFloat(transaction.shares) || 0;
    } else if (transaction.quantity !== undefined && transaction.quantity !== null) {
      transactionAmount = parseFloat(transaction.quantity) || 0;
    }
    
    // Normalize type to determine if it's a buy or sell
    const typeUpper = String(transactionType).toUpperCase();
    
    // Check if it's an acquisition (buy)
    if (
      typeUpper.includes('BUY') || 
      typeUpper.includes('ACQUIRE') || 
      typeUpper.includes('PURCHASE') ||
      typeUpper === 'A' ||
      typeUpper.includes('GRANT') ||
      typeUpper.includes('AWARD') ||
      typeUpper.includes('EXERCISE')
    ) {
      groupedByQuarter[key].acquiredTransactions++;
      groupedByQuarter[key].totalAcquired += transactionAmount;
    } 
    // Check if it's a disposal (sell)
    else if (
      typeUpper.includes('SELL') || 
      typeUpper.includes('DISPOSE') || 
      typeUpper.includes('SALE') ||
      typeUpper === 'D' ||
      typeUpper.includes('TRANSFER')
    ) {
      groupedByQuarter[key].disposedTransactions++;
      groupedByQuarter[key].totalDisposed += transactionAmount;
    } 
    // Log unrecognized types
    else {
      console.log(`Unrecognized transaction type: ${transactionType}`);
    }
  }
  
  // Convert grouped data to array and calculate metrics
  const result = Object.values(groupedByQuarter).map(quarterData => {
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
    
    // Find symbol and CIK
    let symbol = '';
    let cik = '';
    
    if (transactions.length > 0) {
      // Extract symbol
      symbol = transactions[0].symbol || transactions[0].ticker || '';
      
      // Extract CIK
      cik = transactions[0].reportingCik || 
            transactions[0].cik || 
            transactions[0].reportingPersonId || 
            '';
    }
    
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
      totalPurchases: acquiredTransactions,
      totalSales: disposedTransactions
    };
  });
  
  // Sort by year and quarter (newest first)
  return result.sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return b.quarter - a.quarter;
  });
}

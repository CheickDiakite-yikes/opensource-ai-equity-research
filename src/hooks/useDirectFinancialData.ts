
import { useState, useEffect, useRef } from "react";
import { 
  fetchIncomeStatements, 
  fetchBalanceSheets, 
  fetchCashFlowStatements,
  fetchKeyRatios,
  withRetry
} from "@/services/api";
import { toast } from "sonner";
import { IncomeStatement, BalanceSheet, CashFlowStatement, KeyRatio } from "@/types";

interface DirectFinancialData {
  income: IncomeStatement[];
  balance: BalanceSheet[];
  cashflow: CashFlowStatement[];
  ratios: KeyRatio[];
}

export const useDirectFinancialData = (
  symbol: string,
  initialData: DirectFinancialData
) => {
  const [directFinancials, setDirectFinancials] = useState<DirectFinancialData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);
  const hasAttemptedFetch = useRef(false);

  // Reset the mounted state on cleanup
  useEffect(() => {
    isMounted.current = true;
    hasAttemptedFetch.current = false;
    
    return () => {
      isMounted.current = false;
    };
  }, [symbol]);

  // Try to fetch missing data directly when needed
  useEffect(() => {
    // Skip if we already have data or have tried fetching
    if (hasAttemptedFetch.current) return;
    
    const fetchMissingData = async () => {
      // First, check if we need to fetch any missing data
      const hasMinimumFinancialData = (
        (initialData.income.length > 0 ? 1 : 0) + 
        (initialData.balance.length > 0 ? 1 : 0) + 
        (initialData.cashflow.length > 0 ? 1 : 0)
      ) >= 2;
      
      if (!hasMinimumFinancialData) {
        hasAttemptedFetch.current = true;
        setIsLoading(true);
        console.log("Attempting to fetch missing financial data directly for", symbol);
        
        try {
          // Start with data from initialData
          const newFinancials = { ...directFinancials };
          let dataImproved = false;
          
          // Try to fetch income statements if missing
          if (initialData.income.length === 0) {
            try {
              console.log(`Fetching income statements for ${symbol}...`);
              const incomeData = await withRetry(() => fetchIncomeStatements(symbol), {
                retries: 2
              });
              if (incomeData && incomeData.length > 0 && isMounted.current) {
                newFinancials.income = incomeData;
                dataImproved = true;
                console.log(`Retrieved ${incomeData.length} income statements directly`);
              }
            } catch (err) {
              console.error("Error fetching income statements:", err);
            }
          }
          
          // Try to fetch balance sheets if missing
          if (initialData.balance.length === 0) {
            try {
              console.log(`Fetching balance sheets for ${symbol}...`);
              const balanceData = await withRetry(() => fetchBalanceSheets(symbol), {
                retries: 2
              });
              if (balanceData && balanceData.length > 0 && isMounted.current) {
                newFinancials.balance = balanceData;
                dataImproved = true;
                console.log(`Retrieved ${balanceData.length} balance sheets directly`);
              }
            } catch (err) {
              console.error("Error fetching balance sheets:", err);
            }
          }
          
          // Try to fetch cash flow statements if missing
          if (initialData.cashflow.length === 0) {
            try {
              console.log(`Fetching cash flow statements for ${symbol}...`);
              const cashflowData = await withRetry(() => fetchCashFlowStatements(symbol), {
                retries: 2
              });
              if (cashflowData && cashflowData.length > 0 && isMounted.current) {
                newFinancials.cashflow = cashflowData;
                dataImproved = true;
                console.log(`Retrieved ${cashflowData.length} cash flow statements directly`);
              }
            } catch (err) {
              console.error("Error fetching cash flow statements:", err);
            }
          }
          
          // Try to fetch ratios if missing
          if (initialData.ratios.length === 0) {
            try {
              console.log(`Fetching key ratios for ${symbol}...`);
              const ratiosData = await withRetry(() => fetchKeyRatios(symbol), {
                retries: 2
              });
              if (ratiosData && ratiosData.length > 0 && isMounted.current) {
                newFinancials.ratios = ratiosData;
                dataImproved = true;
                console.log(`Retrieved ${ratiosData.length} financial ratios directly`);
              }
            } catch (err) {
              console.error("Error fetching key ratios:", err);
            }
          }
          
          // Update state if we improved the data and component is still mounted
          if (dataImproved && isMounted.current) {
            setDirectFinancials(newFinancials);
            toast.success("Retrieved additional financial data");
          } else if (isMounted.current) {
            toast.error(`Could not retrieve financial data for ${symbol}`);
          }
        } catch (err) {
          console.error("Error fetching missing financial data:", err);
          if (isMounted.current) {
            toast.error(`Failed to retrieve financial data: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        } finally {
          if (isMounted.current) {
            setIsLoading(false);
          }
        }
      }
    };
    
    fetchMissingData();
  }, [symbol, initialData, directFinancials]);

  // Function to manually retry fetching data
  const retryFetchingData = async (): Promise<boolean> => {
    if (!isMounted.current) return false;
    
    setIsLoading(true);
    toast.info(`Attempting to fetch financial data for ${symbol}...`);
    
    try {
      // Directly fetch all financial statements with higher retry counts
      const [income, balance, cashflow, ratios] = await Promise.all([
        withRetry(() => fetchIncomeStatements(symbol), { retries: 3 }),
        withRetry(() => fetchBalanceSheets(symbol), { retries: 3 }),
        withRetry(() => fetchCashFlowStatements(symbol), { retries: 3 }),
        withRetry(() => fetchKeyRatios(symbol), { retries: 3 })
      ]);
      
      // Update the direct financials state if component still mounted
      if (isMounted.current) {
        setDirectFinancials({
          income,
          balance,
          cashflow,
          ratios
        });
      }
      
      // Check if we got enough data
      const gotEnoughData = (
        (income.length > 0 ? 1 : 0) + 
        (balance.length > 0 ? 1 : 0) + 
        (cashflow.length > 0 ? 1 : 0)
      ) >= 2;
      
      if (gotEnoughData && isMounted.current) {
        toast.success(`Successfully retrieved financial data for ${symbol}`);
        return true;
      } else if (isMounted.current) {
        toast.error(`Could not retrieve enough financial data for ${symbol}`);
        return false;
      }
      
      return gotEnoughData;
    } catch (err) {
      console.error("Error in retry operation:", err);
      if (isMounted.current) {
        toast.error(`Retry failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      return false;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return {
    directFinancials,
    retryFetchingData,
    isLoading
  };
};

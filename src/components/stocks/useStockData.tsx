
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { StockProfile, StockQuote } from "@/types/apiTypes";
import { IncomeStatement, BalanceSheet, CashFlowStatement, KeyRatio } from "@/types/financialStatementTypes";
import { EarningsCall, SECFiling } from "@/types/documentTypes";

// Mock data fetching function - replace with actual API call
const fetchStockData = async (symbol: string) => {
  // In a real implementation, this would make API calls to your backend
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return {
    profile: {
      symbol,
      companyName: `${symbol} Corporation`,
      price: 150.25,
      sector: "Technology",
      industry: "Software",
    } as StockProfile,
    
    quote: {
      symbol,
      price: 150.25,
      change: 2.5,
      changesPercentage: 1.75,
      marketCap: 1200000000000,
    } as StockQuote,
    
    incomeStatements: [
      {
        date: "2023-12-31",
        symbol,
        revenue: 350000000000,
        grossProfit: 150000000000,
        netIncome: 65000000000,
        period: "FY",
      },
      {
        date: "2022-12-31",
        symbol,
        revenue: 320000000000,
        grossProfit: 135000000000,
        netIncome: 60000000000,
        period: "FY",
      }
    ] as IncomeStatement[],
    
    balanceSheets: [
      {
        date: "2023-12-31",
        symbol,
        totalAssets: 420000000000,
        totalLiabilities: 180000000000,
        totalStockholdersEquity: 240000000000,
        period: "FY",
      },
      {
        date: "2022-12-31",
        symbol,
        totalAssets: 380000000000,
        totalLiabilities: 160000000000,
        totalStockholdersEquity: 220000000000,
        period: "FY",
      }
    ] as BalanceSheet[],
    
    cashFlowStatements: [
      {
        date: "2023-12-31",
        symbol,
        netCashProvidedByOperatingActivities: 110000000000,
        freeCashFlow: 85000000000,
        period: "FY",
      },
      {
        date: "2022-12-31",
        symbol,
        netCashProvidedByOperatingActivities: 95000000000,
        freeCashFlow: 75000000000,
        period: "FY",
      }
    ] as CashFlowStatement[],
    
    keyRatios: [
      {
        date: "2023-12-31",
        symbol,
        period: "FY",
        returnOnEquity: 0.25,
        returnOnAssets: 0.15,
        netProfitMargin: 0.18,
      },
      {
        date: "2022-12-31",
        symbol,
        period: "FY",
        returnOnEquity: 0.22,
        returnOnAssets: 0.14,
        netProfitMargin: 0.17,
      }
    ] as KeyRatio[],
    
    transcripts: [
      {
        symbol,
        date: "2023-12-31",
        quarter: "Q4",
        year: "2023",
        content: "Sample earnings call transcript content",
        url: "#",
      }
    ] as EarningsCall[],
    
    filings: [
      {
        symbol,
        type: "10-Q",
        filingDate: "2023-11-01",
        reportDate: "2023-09-30",
        cik: "123456",
        form: "10-Q",
        url: "#",
        filingNumber: "001-12345",
      }
    ] as SECFiling[],
  };
};

export const useStockData = (symbol: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stockData', symbol],
    queryFn: () => fetchStockData(symbol),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (err) => {
      console.error("Error fetching stock data:", err);
      toast.error("Failed to load stock data");
    }
  });

  return {
    data,
    isLoading,
    error: error ? (error as Error).message : null
  };
};

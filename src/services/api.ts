
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { 
  StockProfile, 
  StockQuote, 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement, 
  KeyRatio, 
  HistoricalPriceData, 
  NewsArticle, 
  CompanyPeer, 
  ReportRequest, 
  ResearchReport,
  StockPrediction
} from "@/types";

// Fetch stock profile data
export const fetchStockProfile = async (symbol: string): Promise<StockProfile | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-data', {
      body: { symbol, endpoint: 'profile' }
    });

    if (error) throw new Error(error.message);
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    
    return data[0] as StockProfile;
  } catch (error) {
    console.error("Error fetching stock profile:", error);
    toast({
      title: "Error",
      description: `Failed to fetch profile data: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Fetch stock quote data
export const fetchStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-data', {
      body: { symbol, endpoint: 'quote' }
    });

    if (error) throw new Error(error.message);
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    
    return data[0] as StockQuote;
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    toast({
      title: "Error",
      description: `Failed to fetch quote data: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Fetch income statements
export const fetchIncomeStatements = async (symbol: string): Promise<IncomeStatement[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-data', {
      body: { symbol, endpoint: 'income-statement' }
    });

    if (error) throw new Error(error.message);
    if (!data || !Array.isArray(data)) return [];
    
    return data as IncomeStatement[];
  } catch (error) {
    console.error("Error fetching income statements:", error);
    toast({
      title: "Error",
      description: `Failed to fetch income statement data: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Fetch balance sheets
export const fetchBalanceSheets = async (symbol: string): Promise<BalanceSheet[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-data', {
      body: { symbol, endpoint: 'balance-sheet' }
    });

    if (error) throw new Error(error.message);
    if (!data || !Array.isArray(data)) return [];
    
    return data as BalanceSheet[];
  } catch (error) {
    console.error("Error fetching balance sheets:", error);
    toast({
      title: "Error",
      description: `Failed to fetch balance sheet data: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Fetch cash flow statements
export const fetchCashFlowStatements = async (symbol: string): Promise<CashFlowStatement[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-data', {
      body: { symbol, endpoint: 'cash-flow' }
    });

    if (error) throw new Error(error.message);
    if (!data || !Array.isArray(data)) return [];
    
    return data as CashFlowStatement[];
  } catch (error) {
    console.error("Error fetching cash flow statements:", error);
    toast({
      title: "Error",
      description: `Failed to fetch cash flow data: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Fetch financial ratios
export const fetchKeyRatios = async (symbol: string): Promise<KeyRatio[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-data', {
      body: { symbol, endpoint: 'ratios' }
    });

    if (error) throw new Error(error.message);
    if (!data || !Array.isArray(data)) return [];
    
    return data as KeyRatio[];
  } catch (error) {
    console.error("Error fetching key ratios:", error);
    toast({
      title: "Error",
      description: `Failed to fetch financial ratios data: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Fetch historical price data
export const fetchHistoricalPrices = async (symbol: string): Promise<HistoricalPriceData | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-data', {
      body: { symbol, endpoint: 'historical-price' }
    });

    if (error) throw new Error(error.message);
    if (!data || !data.historical || !Array.isArray(data.historical)) return null;
    
    return data as HistoricalPriceData;
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    toast({
      title: "Error",
      description: `Failed to fetch historical price data: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Fetch company news
export const fetchCompanyNews = async (symbol: string): Promise<NewsArticle[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-data', {
      body: { symbol, endpoint: 'news' }
    });

    if (error) throw new Error(error.message);
    if (!data || !Array.isArray(data)) return [];
    
    return data as NewsArticle[];
  } catch (error) {
    console.error("Error fetching company news:", error);
    toast({
      title: "Error",
      description: `Failed to fetch news data: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Fetch company peers
export const fetchCompanyPeers = async (symbol: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-data', {
      body: { symbol, endpoint: 'peers' }
    });

    if (error) throw new Error(error.message);
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    const peerData = data[0] as CompanyPeer;
    return peerData.peersList || [];
  } catch (error) {
    console.error("Error fetching company peers:", error);
    toast({
      title: "Error",
      description: `Failed to fetch peer data: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Generate research report
export const generateResearchReport = async (reportRequest: ReportRequest): Promise<ResearchReport | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-research-report', {
      body: { reportRequest }
    });

    if (error) throw new Error(error.message);
    if (!data) return null;
    
    return data as ResearchReport;
  } catch (error) {
    console.error("Error generating research report:", error);
    toast({
      title: "Error",
      description: `Failed to generate research report: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Generate stock price prediction
export const generateStockPrediction = async (
  symbol: string, 
  stockData: StockQuote, 
  financials: any, 
  news: NewsArticle[]
): Promise<StockPrediction | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('predict-stock-price', {
      body: { symbol, stockData, financials, news }
    });

    if (error) throw new Error(error.message);
    if (!data) return null;
    
    return data as StockPrediction;
  } catch (error) {
    console.error("Error generating stock prediction:", error);
    toast({
      title: "Error",
      description: `Failed to generate stock prediction: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Get all financial data for a symbol
export const getAllFinancialData = async (symbol: string) => {
  const profile = await fetchStockProfile(symbol);
  const quote = await fetchStockQuote(symbol);
  const incomeStatements = await fetchIncomeStatements(symbol);
  const balanceSheets = await fetchBalanceSheets(symbol);
  const cashFlowStatements = await fetchCashFlowStatements(symbol);
  const keyRatios = await fetchKeyRatios(symbol);
  const historicalPrices = await fetchHistoricalPrices(symbol);
  const news = await fetchCompanyNews(symbol);
  const peers = await fetchCompanyPeers(symbol);

  return {
    profile,
    quote,
    incomeStatements,
    balanceSheets,
    cashFlowStatements,
    keyRatios,
    historicalPrices,
    news,
    peers
  };
};

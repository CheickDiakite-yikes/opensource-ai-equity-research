
import { toast } from "@/components/ui/use-toast";
import { 
  fetchStockProfile, 
  fetchStockQuote, 
  fetchIncomeStatements, 
  fetchBalanceSheets, 
  fetchCashFlowStatements, 
  fetchKeyRatios, 
  fetchKeyRatiosTTM,
  fetchIncomeStatementTTM,
  fetchBalanceSheetTTM,
  fetchCashFlowStatementTTM,
  fetchCompanyNews, 
  fetchCompanyPeers, 
  fetchEarningsTranscripts,
  fetchSECFilings
} from "@/services/api";
import { DataLoadingStatus } from "../types/reportTypes";
import { KeyRatio } from "@/types/financial/ratioTypes";

/**
 * Fetches data with status tracking for the report
 */
export const fetchWithStatus = async <T,>(
  key: string, 
  fetchFn: () => Promise<T>,
  errorValue: T,
  statusTracker: {[key: string]: string},
  setDataLoadingStatus: (status: DataLoadingStatus) => void
): Promise<T> => {
  try {
    updateStatus(key, 'loading', statusTracker, setDataLoadingStatus);
    const result = await fetchFn();
    updateStatus(key, result ? 'success' : 'empty', statusTracker, setDataLoadingStatus);
    return result;
  } catch (err) {
    console.error(`Error fetching ${key}:`, err);
    updateStatus(key, 'error', statusTracker, setDataLoadingStatus);
    return errorValue;
  }
};

/**
 * Updates the status of a data fetching operation
 */
export const updateStatus = (
  key: string, 
  status: string,
  statusTracker: {[key: string]: string},
  setDataLoadingStatus: (status: DataLoadingStatus) => void
) => {
  statusTracker[key] = status;
  setDataLoadingStatus({...statusTracker});
};

/**
 * Fetches all report data for a given symbol
 */
export const fetchAllReportData = async (
  symbol: string,
  statusTracker: {[key: string]: string},
  setDataLoadingStatus: (status: DataLoadingStatus) => void
) => {
  try {
    const [profile, quote] = await Promise.all([
      fetchWithStatus('profile', () => fetchStockProfile(symbol), null, statusTracker, setDataLoadingStatus),
      fetchWithStatus('quote', () => fetchStockQuote(symbol), null, statusTracker, setDataLoadingStatus)
    ]);
    
    if (!profile || !quote) {
      throw new Error(`Could not fetch core data for ${symbol}`);
    }
    
    const [
      income, 
      incomeTTM,
      balance, 
      balanceTTM,
      cashflow, 
      cashflowTTM,
      ratios, 
      ratiosTTM,
      news, 
      peers, 
      transcripts, 
      filings
    ] = await Promise.all([
      fetchWithStatus('income', () => fetchIncomeStatements(symbol), [], statusTracker, setDataLoadingStatus),
      fetchWithStatus('incomeTTM', () => fetchIncomeStatementTTM(symbol), null, statusTracker, setDataLoadingStatus),
      fetchWithStatus('balance', () => fetchBalanceSheets(symbol), [], statusTracker, setDataLoadingStatus),
      fetchWithStatus('balanceTTM', () => fetchBalanceSheetTTM(symbol), null, statusTracker, setDataLoadingStatus),
      fetchWithStatus('cashflow', () => fetchCashFlowStatements(symbol), [], statusTracker, setDataLoadingStatus),
      fetchWithStatus('cashflowTTM', () => fetchCashFlowStatementTTM(symbol), null, statusTracker, setDataLoadingStatus),
      fetchWithStatus('ratios', () => fetchKeyRatios(symbol), [], statusTracker, setDataLoadingStatus),
      fetchWithStatus('ratiosTTM', () => fetchKeyRatiosTTM(symbol), null, statusTracker, setDataLoadingStatus),
      fetchWithStatus('news', () => fetchCompanyNews(symbol), [], statusTracker, setDataLoadingStatus),
      fetchWithStatus('peers', () => fetchCompanyPeers(symbol), [], statusTracker, setDataLoadingStatus),
      fetchWithStatus('transcripts', () => fetchEarningsTranscripts(symbol), [], statusTracker, setDataLoadingStatus),
      fetchWithStatus('filings', () => fetchSECFilings(symbol), [], statusTracker, setDataLoadingStatus)
    ]);
    
    return {
      profile,
      quote,
      income: Array.isArray(income) ? income : [],
      incomeTTM,
      balance: Array.isArray(balance) ? balance : [],
      balanceTTM,
      cashflow: Array.isArray(cashflow) ? cashflow : [],
      cashflowTTM,
      ratios: Array.isArray(ratios) ? ratios : [],
      ratiosTTM,
      news: Array.isArray(news) ? news : [],
      peers: Array.isArray(peers) ? peers : [],
      transcripts: Array.isArray(transcripts) ? transcripts : [],
      filings: Array.isArray(filings) ? filings : []
    };
  } catch (error) {
    throw error;
  }
};

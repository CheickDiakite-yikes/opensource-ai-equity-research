
import { DataLoadingStatus, ReportData } from "./types";

/**
 * Utility function to fetch data with status tracking
 */
export const fetchWithStatus = async <T,>(
  statusTracker: {[key: string]: string},
  updateStatus: (key: string, status: string) => void,
  key: string, 
  fetchFn: () => Promise<T>,
  errorValue: T
): Promise<T> => {
  try {
    updateStatus(key, 'loading');
    const result = await fetchFn();
    updateStatus(key, result ? 'success' : 'empty');
    return result;
  } catch (err) {
    console.error(`Error fetching ${key}:`, err);
    updateStatus(key, 'error');
    return errorValue;
  }
};

/**
 * Create the initial empty report data structure
 */
export const createEmptyReportData = (): ReportData => ({
  profile: null,
  quote: null,
  income: [],
  incomeTTM: null,
  balance: [],
  balanceTTM: null,
  cashflow: [],
  cashflowTTM: null,
  ratios: [],
  ratiosTTM: null,
  news: [],
  peers: [],
  transcripts: [],
  filings: []
});

/**
 * Log the data loaded for a symbol for debugging
 */
export const logDataStatus = (symbol: string, data: ReportData): void => {
  console.log(`Data loaded for ${symbol}:`, {
    profile: !!data.profile,
    quote: !!data.quote,
    income: data.income.length,
    incomeTTM: !!data.incomeTTM,
    balance: data.balance.length,
    balanceTTM: !!data.balanceTTM,
    cashflow: data.cashflow.length,
    cashflowTTM: !!data.cashflowTTM,
    ratios: data.ratios.length,
    ratiosTTM: !!data.ratiosTTM,
    news: data.news.length,
    peers: data.peers.length,
    transcripts: data.transcripts.length,
    filings: data.filings.length
  });
};

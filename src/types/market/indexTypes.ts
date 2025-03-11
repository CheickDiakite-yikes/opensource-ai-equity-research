// Types related to stock market indices

/**
 * Basic index information
 */
export interface MarketIndex {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
}

/**
 * Market region with indices
 */
export interface MarketRegion {
  name: string;
  indices: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  }[];
}

/**
 * Detailed index quote data
 */
export interface IndexQuote {
  symbol: string;
  name: string;
  price: number;
  changePercentage: number;
  change: number;
  volume: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number | null;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  open: number;
  previousClose: number;
  timestamp: number;
}

/**
 * Abbreviated index quote data
 */
export interface IndexShortQuote {
  symbol: string;
  price: number;
  change: number;
  volume: number;
}

/**
 * End-of-day light historical index data
 */
export interface IndexHistoricalLightData {
  symbol: string;
  date: string;
  price: number;
  volume: number;
}

/**
 * End-of-day full historical index data
 */
export interface IndexHistoricalFullData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  vwap: number;
}

/**
 * Intraday index data
 */
export interface IndexIntradayData {
  date: string;
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
}

/**
 * Index constituent company
 */
export interface IndexConstituent {
  symbol: string;
  name: string;
  sector: string;
  subSector: string;
  headQuarter: string;
  dateFirstAdded: string | null;
  cik: string;
  founded: string;
}

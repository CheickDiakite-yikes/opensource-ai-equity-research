
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/fetch-utils.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

/**
 * Fetch real-time market indices data from FMP
 */
export async function fetchMarketIndices() {
  try {
    // Create structured objects for each region
    const americas = {
      name: "Americas",
      indices: await fetchRegionIndices(['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'])
    };
    
    const europe = {
      name: "Europe",
      indices: await fetchRegionIndices(['^FTSE', '^FCHI', '^GDAXI', '^STOXX50E', '^STOXX'])
    };
    
    const asia = {
      name: "Asia",
      indices: await fetchRegionIndices(['^N225', '^HSI', '^AXJO', '^KS11', '^BSESN'])
    };
    
    return [americas, europe, asia];
  } catch (error) {
    console.error("Error fetching market indices:", error);
    return getFallbackMarketIndices();
  }
}

/**
 * Fetch real-time data for multiple indices
 */
async function fetchRegionIndices(symbols: string[]) {
  try {
    const symbolsString = symbols.join(',');
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbolsString}?apikey=${FMP_API_KEY}`;
    
    const response = await fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`API error (${response.status}): Unable to fetch index data`);
    }
    
    const data = await response.json();
    
    // Transform API response to our MarketIndex format
    return data.map((item: any) => ({
      symbol: item.symbol,
      name: getIndexName(item.symbol),
      price: item.price,
      change: item.change,
      changePercent: item.changesPercentage
    }));
  } catch (error) {
    console.error(`Error fetching indices data:`, error);
    return [];
  }
}

/**
 * Map index symbols to human-readable names
 */
function getIndexName(symbol: string): string {
  const indexNames: Record<string, string> = {
    '^GSPC': 'S&P 500',
    '^DJI': 'Dow 30',
    '^IXIC': 'Nasdaq',
    '^RUT': 'Russell 2000',
    '^VIX': 'VIX',
    '^FTSE': 'FTSE 100',
    '^FCHI': 'CAC 40',
    '^GDAXI': 'DAX',
    '^STOXX50E': 'Euro Stoxx 50',
    '^STOXX': 'STOXX 600',
    '^N225': 'Nikkei 225',
    '^HSI': 'Hang Seng',
    '^AXJO': 'S&P/ASX 200',
    '^KS11': 'KOSPI',
    '^BSESN': 'BSE SENSEX'
  };
  
  return indexNames[symbol] || symbol;
}

/**
 * Fetch historical price data for a specific symbol
 */
export async function fetchHistoricalPrice(symbol: string) {
  const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error (${response.status}): Unable to fetch historical price data for ${symbol}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Fetch company news
 */
export async function fetchNews(symbol: string) {
  const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=10&apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.warn(`News data fetch failed with status ${response.status}`);
    return [];
  }
  
  const data = await response.json();
  return data;
}

/**
 * Fetch company peers
 */
export async function fetchPeers(symbol: string) {
  const url = `https://financialmodelingprep.com/api/v3/stock-peers?symbol=${symbol}&apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.warn(`Peers data fetch failed with status ${response.status}`);
    return [{ peersList: [] }];
  }
  
  const data = await response.json();
  return data.length > 0 ? data : [{ peersList: [] }];
}

/**
 * Fetch sector performance data
 */
export async function fetchSectorPerformance() {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const url = `https://financialmodelingprep.com/api/v3/sector-performance?date=${formattedDate}&apikey=${FMP_API_KEY}`;
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      throw new Error(`API error (${response.status}): Unable to fetch sector performance data`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sector performance:", error);
    return [];
  }
}

/**
 * Fallback mock data for market indices
 */
const getFallbackMarketIndices = () => {
  return [
    {
      name: "Americas",
      indices: [
        { symbol: "^GSPC", name: "S&P 500", price: 5954.50, change: 92.75, changePercent: 1.59 },
        { symbol: "^DJI", name: "Dow 30", price: 43840.91, change: 602.20, changePercent: 1.39 },
        { symbol: "^IXIC", name: "Nasdaq", price: 18847.28, change: 302.63, changePercent: 1.63 },
        { symbol: "^RUT", name: "Russell 2000", price: 2163.07, change: 23.24, changePercent: 1.09 },
        { symbol: "^VIX", name: "VIX", price: 19.63, change: -1.50, changePercent: -7.10 }
      ]
    },
    {
      name: "Europe",
      indices: [
        { symbol: "^FTSE", name: "FTSE 100", price: 8809.74, change: 53.53, changePercent: 0.61 },
        { symbol: "^FCHI", name: "CAC 40", price: 8111.63, change: 8.92, changePercent: 0.11 },
        { symbol: "^GDAXI", name: "DAX", price: 22551.43, change: 0.00, changePercent: 0.00 },
        { symbol: "^STOXX50E", name: "Euro Stoxx 50", price: 5463.54, change: -8.74, changePercent: -0.16 },
        { symbol: "^STOXX", name: "STOXX 600", price: 523.48, change: -0.32, changePercent: -0.06 }
      ]
    },
    {
      name: "Asia",
      indices: [
        { symbol: "^N225", name: "Nikkei 225", price: 37676.02, change: 520.62, changePercent: 1.40 },
        { symbol: "^HSI", name: "Hang Seng", price: 23220.57, change: 280.40, changePercent: 1.22 },
        { symbol: "^AXJO", name: "S&P/ASX 200", price: 8224.30, change: 52.30, changePercent: 0.64 },
        { symbol: "^KS11", name: "KOSPI", price: 2532.78, change: -88.93, changePercent: -3.39 },
        { symbol: "^BSESN", name: "BSE SENSEX", price: 73289.91, change: 95.21, changePercent: 0.13 }
      ]
    }
  ];
};

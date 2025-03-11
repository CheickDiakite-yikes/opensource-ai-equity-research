
import { invokeSupabaseFunction } from "../base";

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketRegion {
  name: string;
  indices: MarketIndex[];
}

/**
 * Fetch market indices data from FMP API
 */
export const fetchMarketIndices = async (): Promise<MarketRegion[]> => {
  try {
    const result = await invokeSupabaseFunction<any>('get-stock-data', { 
      endpoint: 'market-indices' 
    });
    
    if (result && Array.isArray(result)) {
      return result as MarketRegion[];
    }
    
    console.warn("Falling back to mock market indices data");
    return getFallbackMarketIndices();
  } catch (error) {
    console.error("Error fetching market indices:", error);
    return getFallbackMarketIndices();
  }
};

/**
 * Fallback mock data for market indices
 */
const getFallbackMarketIndices = (): MarketRegion[] => {
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

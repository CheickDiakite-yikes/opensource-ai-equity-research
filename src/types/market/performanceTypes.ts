
// Types related to market performance data

/**
 * Sector performance data
 */
export interface SectorPerformance {
  date: string;
  sector: string;
  exchange?: string;
  averageChange: number;
}

/**
 * Industry performance data
 */
export interface IndustryPerformance {
  date: string;
  industry: string;
  exchange?: string;
  averageChange: number;
}

/**
 * Sector price-to-earnings ratio
 */
export interface SectorPE {
  date: string;
  sector: string;
  exchange?: string;
  pe: number;
}

/**
 * Industry price-to-earnings ratio
 */
export interface IndustryPE {
  date: string;
  industry: string;
  exchange?: string;
  pe: number;
}

/**
 * Stock market mover data (gainers, losers, most active)
 */
export interface StockMover {
  symbol: string;
  price: number;
  name: string;
  change: number;
  changesPercentage: number;
  exchange: string;
}

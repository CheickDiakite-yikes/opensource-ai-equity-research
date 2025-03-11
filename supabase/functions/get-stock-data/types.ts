
// Market index types
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


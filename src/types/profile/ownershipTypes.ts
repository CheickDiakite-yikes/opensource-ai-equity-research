
export interface OwnershipItem {
  name: string;
  share: number;
  change: number;
  filingDate: string;
  // Additional fields from Finnhub
  cusip?: string;
  isin?: string;
  marketValue?: number;
  portfolioPercent?: number;
  portfolioName?: string;
  putCall?: string;
  exercisePrice?: number;
  reportDate?: string;
  position?: number;
}

export interface OwnershipData {
  symbol: string;
  ownership: OwnershipItem[];
}


/**
 * Financial health scores
 */
export interface FinancialScore {
  symbol: string;
  reportedCurrency: string;
  altmanZScore: number;
  piotroskiScore: number;
  workingCapital: number;
  totalAssets: number;
  retainedEarnings: number;
  ebit: number;
  marketCap: number;
  totalLiabilities: number;
  revenue: number;
}


/**
 * Types for stock ratings and grade news
 */

/**
 * Stock rating snapshot from FMP API
 */
export interface RatingSnapshot {
  symbol: string;
  rating: string;
  overallScore: number;
  discountedCashFlowScore: number;
  returnOnEquityScore: number;
  returnOnAssetsScore: number;
  debtToEquityScore: number;
  priceToEarningsScore: number;
  priceToBookScore: number;
}

/**
 * Stock grade news from FMP API
 * Based on the /grade endpoint from FMP API
 */
export interface GradeNews {
  symbol: string;
  date?: string;        // Alternative date field
  publishedDate: string; // Primary date field
  gradingCompany: string;
  previousGrade: string;
  newGrade: string;
  action: string;       // 'upgrade', 'downgrade', 'maintain', etc.
  newsURL?: string;
  newsTitle?: string;
  newsBaseURL?: string;
  newsPublisher?: string;
  priceWhenPosted?: number;
}

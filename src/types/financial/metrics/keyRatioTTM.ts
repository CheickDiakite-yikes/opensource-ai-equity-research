
/**
 * TTM Key Ratios
 */
export interface KeyRatioTTM {
  symbol: string;
  date: string;
  grossProfitMarginTTM: number;
  operatingProfitMarginTTM: number;
  netProfitMarginTTM: number;
  returnOnAssetsTTM: number;
  returnOnEquityTTM: number;
  debtToEquityRatioTTM: number;
  currentRatioTTM: number;
  quickRatioTTM: number;
  priceToEarningsRatioTTM: number;
  priceToBookRatioTTM: number;
  dividendYieldTTM: number;
  dividendYieldPercentageTTM: number;
  [key: string]: any; // For any additional fields
}

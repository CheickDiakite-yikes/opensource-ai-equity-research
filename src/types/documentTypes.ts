
// Earnings and SEC Filing Types
export interface EarningsCall {
  symbol: string;
  date: string;
  quarter: string;
  year: string;
  content: string;
  url: string;
  highlights?: string[];
}

export interface SECFiling {
  id?: number;
  symbol: string;
  type: string;
  filingDate: string;
  reportDate: string;
  cik: string;
  form: string;
  url: string;
  filingNumber: string;
}

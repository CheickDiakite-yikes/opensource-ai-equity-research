
/**
 * Types for comparable companies analysis
 */

export interface CompanyComparable {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  enterpriseValue: number; // TEV
  revenue: number;
  ebitda: number;
  ebit: number;
  netIncome: number;
  evToSales: number;
  evToEbitda: number;
  evToEbit: number;
  peRatio: number;
}

export interface ComparablesResponse {
  mainCompany: CompanyComparable;
  comparables: CompanyComparable[];
  averages: {
    evToSales: number;
    evToEbitda: number;
    evToEbit: number;
    peRatio: number;
  };
  medians: {
    evToSales: number;
    evToEbitda: number;
    evToEbit: number;
    peRatio: number;
  };
}

export interface ComparablesRequest {
  symbol: string;
  sector?: string;
  industry?: string;
  peers?: string[];
}

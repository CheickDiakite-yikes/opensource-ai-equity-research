
import type { 
  StockProfile, 
  StockQuote 
} from "@/types/profile/companyTypes";
import type { 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement, 
  KeyRatio 
} from "@/types/financial/statementTypes";
import type { 
  KeyRatioTTM 
} from "@/types/financial/metrics/keyRatioTTM";
import type { NewsArticle } from "@/types/news/newsTypes";
import type { 
  EarningsCall,
  SECFiling
} from "@/types/documentTypes";
import type {
  IncomeStatementTTM 
} from "@/types/financial/ttm/incomeStatementTTM";
import type {
  BalanceSheetTTM 
} from "@/types/financial/ttm/balanceSheetTTM";
import type {
  CashFlowStatementTTM 
} from "@/types/financial/ttm/cashFlowTTM";

export interface ReportData {
  profile: StockProfile | null;
  quote: StockQuote | null;
  income: IncomeStatement[];
  incomeTTM: IncomeStatementTTM | null;
  balance: BalanceSheet[];
  balanceTTM: BalanceSheetTTM | null;
  cashflow: CashFlowStatement[];
  cashflowTTM: CashFlowStatementTTM | null;
  ratios: KeyRatio[];
  ratiosTTM: KeyRatioTTM | null;
  news: NewsArticle[];
  peers: string[];
  transcripts: EarningsCall[];
  filings: SECFiling[];
}

export interface DataLoadingStatus {
  [key: string]: string;
}

export interface ReportDataHookResult {
  isLoading: boolean;
  data: ReportData;
  error: string | null;
  dataLoadingStatus: DataLoadingStatus;
  hasStockData: boolean;
  hasFinancialData: boolean;
  showDataWarning: boolean;
}

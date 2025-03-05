
import { 
  StockProfile, 
  StockQuote 
} from "@/types/profile/companyTypes";
import { 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement, 
  KeyRatio 
} from "@/types/financial/statementTypes";
import { 
  KeyRatioTTM 
} from "@/types/financial/metrics/keyRatioTTM";
import { NewsArticle } from "@/types/news/newsTypes";
import { 
  EarningsCall,
  SECFiling
} from "@/types/documentTypes";
import {
  IncomeStatementTTM 
} from "@/types/financial/ttm/incomeStatementTTM";
import {
  BalanceSheetTTM 
} from "@/types/financial/ttm/balanceSheetTTM";
import {
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

export interface ResearchReportDataReturn {
  isLoading: boolean;
  data: ReportData;
  error: string | null;
  dataLoadingStatus: DataLoadingStatus;
  hasStockData: boolean;
  hasFinancialData: boolean;
  showDataWarning: boolean;
}

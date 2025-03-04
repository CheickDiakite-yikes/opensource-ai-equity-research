
// Stock Profile Types
import { IncomeStatement, BalanceSheet, CashFlowStatement, KeyRatio } from './financialStatementTypes';

export interface StockProfile {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
  rating: string; // Analyst rating like "Overweight", "Maintain", etc.
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

export interface CompanyPeer {
  symbol: string;
  peersList: string[];
}

export interface NewsArticle {
  symbol: string;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
}

export interface MarketCap {
  symbol: string;
  date: string;
  marketCap: number;
}

export interface SharesFloat {
  symbol: string;
  date: string;
  freeFloat: number;
  floatShares: number;
  outstandingShares: number;
}

export interface CompanyExecutive {
  title: string;
  name: string;
  pay: number | null;
  currencyPay: string;
  gender: string;
  yearBorn: number | null;
  active: boolean | null;
}

export interface ExecutiveCompensation {
  cik: string;
  symbol: string;
  companyName: string;
  filingDate: string;
  acceptedDate: string;
  nameAndPosition: string;
  year: number;
  salary: number;
  bonus: number;
  stockAward: number;
  optionAward: number;
  incentivePlanCompensation: number;
  allOtherCompensation: number;
  total: number;
  link: string;
}

export interface CompanyNote {
  cik: string;
  symbol: string;
  title: string;
  exchange: string;
}

export interface EmployeeCount {
  symbol: string;
  cik: string;
  acceptanceTime: string;
  periodOfReport: string;
  companyName: string;
  formType: string;
  filingDate: string;
  employeeCount: number;
  source: string;
}

// TTM Financial Statement Types
export interface IncomeStatementTTM extends Omit<IncomeStatement, 'period'> {
  period: 'TTM';
}

export interface BalanceSheetTTM extends Omit<BalanceSheet, 'period'> {
  period: 'TTM';
}

export interface CashFlowStatementTTM extends Omit<CashFlowStatement, 'period'> {
  period: 'TTM';
}

// Key Metrics Types
export interface KeyMetric {
  symbol: string;
  date: string;
  period: string;
  reportedCurrency: string;
  marketCap: number;
  enterpriseValue: number;
  evToSales: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  evToEBITDA: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  incomeQuality: number;
  grahamNumber: number;
  grahamNetNet: number;
  workingCapital: number;
  investedCapital: number;
  returnOnAssets: number;
  operatingReturnOnAssets: number;
  returnOnTangibleAssets: number;
  returnOnEquity: number;
  returnOnInvestedCapital: number;
  returnOnCapitalEmployed: number;
  earningsYield: number;
  freeCashFlowYield: number;
  capexToOperatingCashFlow: number;
  capexToDepreciation: number;
  capexToRevenue: number;
  stockBasedCompensationToRevenue: number;
  daysOfSalesOutstanding: number;
  daysOfPayablesOutstanding: number;
  daysOfInventoryOutstanding: number;
  operatingCycle: number;
  cashConversionCycle: number;
  freeCashFlowToEquity: number;
  freeCashFlowToFirm: number;
  tangibleAssetValue: number;
  netCurrentAssetValue: number;
  [key: string]: any; // For any additional fields
}

export interface KeyMetricTTM extends Omit<KeyMetric, 'period'> {
  marketCapTTM: number;
  enterpriseValueTTM: number;
  evToSalesTTM: number;
  evToOperatingCashFlowTTM: number;
  evToFreeCashFlowTTM: number;
  evToEBITDATTM: number;
  netDebtToEBITDATTM: number;
  currentRatioTTM: number;
  incomeQualityTTM: number;
  grahamNumberTTM: number;
  grahamNetNetTTM: number;
  workingCapitalTTM: number;
  investedCapitalTTM: number;
  returnOnAssetsTTM: number;
  operatingReturnOnAssetsTTM: number;
  returnOnTangibleAssetsTTM: number;
  returnOnEquityTTM: number;
  returnOnInvestedCapitalTTM: number;
  returnOnCapitalEmployedTTM: number;
  earningsYieldTTM: number;
  freeCashFlowYieldTTM: number;
  capexToOperatingCashFlowTTM: number;
  capexToDepreciationTTM: number;
  capexToRevenueTTM: number;
  [key: string]: any; // For any additional fields
}

export interface KeyRatioTTM extends Omit<KeyRatio, 'period'> {
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

// Market Performance Types
export interface SectorPerformance {
  date: string;
  sector: string;
  exchange?: string;
  averageChange: number;
}

export interface IndustryPerformance {
  date: string;
  industry: string;
  exchange?: string;
  averageChange: number;
}

export interface SectorPE {
  date: string;
  sector: string;
  exchange?: string;
  pe: number;
}

export interface IndustryPE {
  date: string;
  industry: string;
  exchange?: string;
  pe: number;
}

export interface StockMover {
  symbol: string;
  price: number;
  name: string;
  change: number;
  changesPercentage: number;
  exchange: string;
}

// Index Types
export interface MarketIndex {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
}

export interface IndexQuote {
  symbol: string;
  name: string;
  price: number;
  changePercentage: number;
  change: number;
  volume: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number | null;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface IndexShortQuote {
  symbol: string;
  price: number;
  change: number;
  volume: number;
}

export interface IndexHistoricalLightData {
  symbol: string;
  date: string;
  price: number;
  volume: number;
}

export interface IndexHistoricalFullData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  vwap: number;
}

export interface IndexIntradayData {
  date: string;
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
}

export interface IndexConstituent {
  symbol: string;
  name: string;
  sector: string;
  subSector: string;
  headQuarter: string;
  dateFirstAdded: string | null;
  cik: string;
  founded: string;
}

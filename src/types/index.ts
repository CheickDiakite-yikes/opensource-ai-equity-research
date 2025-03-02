// API Types
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

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  unadjustedVolume: number;
  change: number;
  changePercent: number;
  vwap: number;
  label: string;
  changeOverTime: number;
}

export interface HistoricalPriceData {
  symbol: string;
  historical: HistoricalPrice[];
}

export interface FinancialStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  [key: string]: any; // Additional fields will vary based on statement type
}

export interface IncomeStatement extends FinancialStatement {
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  researchAndDevelopmentExpenses: number;
  generalAndAdministrativeExpenses: number;
  sellingAndMarketingExpenses: number;
  sellingGeneralAndAdministrativeExpenses: number;
  otherExpenses: number;
  operatingExpenses: number;
  costAndExpenses: number;
  interestIncome: number;
  interestExpense: number;
  depreciationAndAmortization: number;
  ebitda: number;
  ebitdaratio: number;
  operatingIncome: number;
  operatingIncomeRatio: number;
  totalOtherIncomeExpensesNet: number;
  incomeBeforeTax: number;
  incomeBeforeTaxRatio: number;
  incomeTaxExpense: number;
  netIncome: number;
  netIncomeRatio: number;
  eps: number;
  epsdiluted: number;
  weightedAverageShsOut: number;
  weightedAverageShsOutDil: number;
}

export interface BalanceSheet extends FinancialStatement {
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  cashAndShortTermInvestments: number;
  netReceivables: number;
  inventory: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;
  propertyPlantEquipmentNet: number;
  goodwill: number;
  intangibleAssets: number;
  goodwillAndIntangibleAssets: number;
  longTermInvestments: number;
  taxAssets: number;
  otherNonCurrentAssets: number;
  totalNonCurrentAssets: number;
  otherAssets: number;
  totalAssets: number;
  accountPayables: number;
  shortTermDebt: number;
  taxPayables: number;
  deferredRevenue: number;
  otherCurrentLiabilities: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  deferredRevenueNonCurrent: number;
  deferredTaxLiabilitiesNonCurrent: number;
  otherNonCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  otherLiabilities: number;
  capitalLeaseObligations: number;
  totalLiabilities: number;
  preferredStock: number;
  commonStock: number;
  retainedEarnings: number;
  accumulatedOtherComprehensiveIncomeLoss: number;
  othertotalStockholdersEquity: number;
  totalStockholdersEquity: number;
  totalLiabilitiesAndStockholdersEquity: number;
  minorityInterest: number;
  totalEquity: number;
  totalLiabilitiesAndTotalEquity: number;
  totalInvestments: number;
  totalDebt: number;
  netDebt: number;
}

export interface CashFlowStatement extends FinancialStatement {
  netIncome: number;
  depreciationAndAmortization: number;
  deferredIncomeTax: number;
  stockBasedCompensation: number;
  changeInWorkingCapital: number;
  accountsReceivables: number;
  inventory: number;
  accountsPayables: number;
  otherWorkingCapital: number;
  otherNonCashItems: number;
  netCashProvidedByOperatingActivities: number;
  investmentsInPropertyPlantAndEquipment: number;
  acquisitionsNet: number;
  purchasesOfInvestments: number;
  salesMaturitiesOfInvestments: number;
  otherInvestingActivites: number;
  netCashUsedForInvestingActivites: number;
  debtRepayment: number;
  commonStockIssued: number;
  commonStockRepurchased: number;
  dividendsPaid: number;
  otherFinancingActivites: number;
  netCashUsedProvidedByFinancingActivities: number;
  effectOfForexChangesOnCash: number;
  netChangeInCash: number;
  cashAtEndOfPeriod: number;
  cashAtBeginningOfPeriod: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
}

export interface KeyRatio {
  symbol: string;
  date: string;
  period: string;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  daysOfSalesOutstanding: number;
  daysOfInventoryOutstanding: number;
  operatingCycle: number;
  daysOfPayablesOutstanding: number;
  cashConversionCycle: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  pretaxProfitMargin: number;
  netProfitMargin: number;
  effectiveTaxRate: number;
  returnOnAssets: number;
  returnOnEquity: number;
  returnOnCapitalEmployed: number;
  netIncomePerEBT: number;
  ebtPerEbit: number;
  ebitPerRevenue: number;
  debtRatio: number;
  debtEquityRatio: number;
  longTermDebtToCapitalization: number;
  totalDebtToCapitalization: number;
  interestCoverage: number;
  cashFlowToDebtRatio: number;
  companyEquityMultiplier: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  fixedAssetTurnover: number;
  assetTurnover: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  payoutRatio: number;
  operatingCashFlowSalesRatio: number;
  freeCashFlowOperatingCashFlowRatio: number;
  cashFlowCoverageRatios: number;
  shortTermCoverageRatios: number;
  capitalExpenditureCoverageRatio: number;
  dividendPaidAndCapexCoverageRatio: number;
  dividendPayoutRatio: number;
  priceBookValueRatio: number;
  priceToBookRatio: number;
  priceToSalesRatio: number;
  priceEarningsRatio: number;
  priceToFreeCashFlowsRatio: number;
  priceToOperatingCashFlowsRatio: number;
  priceCashFlowRatio: number;
  priceEarningsToGrowthRatio: number;
  priceSalesRatio: number;
  dividendYield: number;
  enterpriseValueMultiple: number;
  priceFairValue: number;
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

// OpenAI Types
export interface ReportRequest {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  description: string;
  stockData: StockQuote;
  financials: {
    income: IncomeStatement[];
    balance: BalanceSheet[];
    cashflow: CashFlowStatement[];
    ratios: KeyRatio[];
  };
  news: NewsArticle[];
  peers: string[];
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface ResearchReport {
  symbol: string;
  companyName: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  summary: string;
  sections: ReportSection[];
}

export interface StockPrediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: {
    oneMonth: number;
    threeMonths: number;
    sixMonths: number;
    oneYear: number;
  };
  sentimentAnalysis: string;
  confidenceLevel: number;
  keyDrivers: string[];
  risks: string[];
}

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
  symbol: string;
  type: string;
  filingDate: string;
  reportDate: string;
  cik: string;
  form: string;
  url: string;
  filingNumber: string;
}

import { invokeSupabaseFunction } from "./base";
import { 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement 
} from "@/types";
import { OwnershipData, OwnershipItem } from "@/types/profile/ownershipTypes";

// Types for Finnhub financial data
interface FinnhubFinancialData {
  financials: Array<Record<string, any>>;
  symbol: string;
}

// Map Finnhub financial data to our app's data structures
const mapFinnhubToIncomeStatement = (data: FinnhubFinancialData): IncomeStatement[] => {
  if (!data || !data.financials || !Array.isArray(data.financials)) return [];
  
  return data.financials.map(item => ({
    date: item.period || "",
    symbol: data.symbol,
    reportedCurrency: "USD", // Finnhub typically reports in USD
    cik: "", // Required field but not provided by Finnhub
    fillingDate: item.period || "",
    acceptedDate: item.period || "",
    calendarYear: item.year?.toString() || item.period?.substring(0, 4) || "",
    period: item.period?.includes("Q") ? "Q" : "FY",
    revenue: item.revenue || 0,
    costOfRevenue: item.costOfGoodsSold || 0,
    grossProfit: item.grossIncome || (item.revenue - item.costOfGoodsSold) || 0,
    grossProfitRatio: ((item.grossIncome || (item.revenue - item.costOfGoodsSold) || 0) / (item.revenue || 1)) || 0,
    researchAndDevelopmentExpenses: item.researchDevelopment || 0,
    generalAndAdministrativeExpenses: item.sgaExpense || 0,
    sellingAndMarketingExpenses: 0, // Not directly provided by Finnhub
    sellingGeneralAndAdministrativeExpenses: item.sgaExpense || 0,
    otherExpenses: 0, // Not directly provided by Finnhub
    operatingExpenses: item.totalOperatingExpense || 0,
    costAndExpenses: (item.totalOperatingExpense || 0) + (item.costOfGoodsSold || 0),
    operatingIncome: item.ebit || 0,
    operatingIncomeRatio: (item.ebit || 0) / (item.revenue || 1),
    interestIncome: item.interestIncome || 0,
    interestExpense: item.interestExpense || 0,
    depreciationAndAmortization: item.depreciation || 0,
    ebitda: item.ebitda || 0,
    ebitdaratio: (item.ebitda || 0) / (item.revenue || 1),
    totalOtherIncomeExpensesNet: item.totalOtherIncomeExpenseNet || 0,
    incomeBeforeTax: item.pretaxIncome || 0,
    incomeBeforeTaxRatio: (item.pretaxIncome || 0) / (item.revenue || 1),
    incomeTaxExpense: item.provisionForIncomeTaxes || 0,
    netIncome: item.netIncome || 0,
    netIncomeRatio: (item.netIncome || 0) / (item.revenue || 1),
    eps: item.eps || 0,
    epsdiluted: item.dilutedEps || item.eps || 0,
    weightedAverageShsOut: item.weightedAverageShsOut || 0,
    weightedAverageShsOutDil: item.weightedAverageShsOutDil || 0,
    link: "", // Finnhub doesn't provide a direct link
    finalLink: "" // Finnhub doesn't provide a direct link
  }));
};

// Similar mapping functions for balance sheet and cash flow
const mapFinnhubToBalanceSheet = (data: FinnhubFinancialData): BalanceSheet[] => {
  if (!data || !data.financials || !Array.isArray(data.financials)) return [];
  
  return data.financials.map(item => ({
    date: item.period || "",
    symbol: data.symbol,
    reportedCurrency: "USD",
    cik: "", // Required field but not provided by Finnhub
    fillingDate: item.period || "",
    acceptedDate: item.period || "",
    calendarYear: item.year?.toString() || item.period?.substring(0, 4) || "",
    period: item.period?.includes("Q") ? "Q" : "FY",
    cashAndCashEquivalents: item.cashAndCashEquivalents || 0,
    shortTermInvestments: item.shortTermInvestments || 0,
    cashAndShortTermInvestments: (item.cashAndCashEquivalents || 0) + (item.shortTermInvestments || 0),
    netReceivables: item.netReceivables || 0,
    inventory: item.inventory || 0,
    otherCurrentAssets: item.otherCurrentAssets || 0,
    totalCurrentAssets: item.totalCurrentAssets || 0,
    propertyPlantEquipmentNet: item.propertyPlantEquipment || 0,
    goodwill: item.goodwill || 0,
    intangibleAssets: item.intangibleAssets || 0,
    goodwillAndIntangibleAssets: (item.goodwill || 0) + (item.intangibleAssets || 0),
    longTermInvestments: item.longTermInvestments || 0,
    taxAssets: item.taxAssets || 0,
    otherNonCurrentAssets: item.otherNonCurrentAssets || 0,
    totalNonCurrentAssets: item.totalNonCurrentAssets || (item.totalAssets - item.totalCurrentAssets) || 0,
    otherAssets: item.otherAssets || 0,
    totalAssets: item.totalAssets || 0,
    accountPayables: item.accountsPayable || 0,
    shortTermDebt: item.shortTermDebt || 0,
    taxPayables: item.taxPayables || 0,
    deferredRevenue: item.deferredRevenue || 0,
    otherCurrentLiabilities: item.otherCurrentLiabilities || 0,
    totalCurrentLiabilities: item.totalCurrentLiabilities || 0,
    longTermDebt: item.longTermDebt || 0,
    deferredRevenueNonCurrent: item.deferredRevenueLongTerm || 0,
    deferredTaxLiabilitiesNonCurrent: item.deferredTaxLiabilitiesNonCurrent || 0,
    otherNonCurrentLiabilities: item.otherNonCurrentLiabilities || 0,
    totalNonCurrentLiabilities: item.totalNonCurrentLiabilities || (item.totalLiabilities - item.totalCurrentLiabilities) || 0,
    otherLiabilities: item.otherLiabilities || 0,
    capitalLeaseObligations: item.capitalLeaseObligations || 0,
    totalLiabilities: item.totalLiabilities || 0,
    preferredStock: item.preferredStock || 0,
    commonStock: item.commonStock || 0,
    retainedEarnings: item.retainedEarnings || 0,
    accumulatedOtherComprehensiveIncomeLoss: item.accumulatedOtherComprehensiveIncomeLoss || 0,
    othertotalStockholdersEquity: item.otherStockholdersEquity || 0,
    totalStockholdersEquity: item.totalShareholderEquity || 0,
    totalEquity: item.totalEquity || item.totalShareholderEquity || 0,
    totalLiabilitiesAndStockholdersEquity: item.totalLiabilitiesAndShareholdersEquity || item.totalLiabilities + (item.totalShareholderEquity || 0) || 0,
    minorityInterest: item.minorityInterest || 0,
    totalLiabilitiesAndTotalEquity: item.totalLiabilitiesAndTotalEquity || item.totalLiabilities + (item.totalEquity || item.totalShareholderEquity || 0) || 0,
    totalInvestments: (item.shortTermInvestments || 0) + (item.longTermInvestments || 0),
    totalDebt: (item.shortTermDebt || 0) + (item.longTermDebt || 0),
    netDebt: (item.shortTermDebt || 0) + (item.longTermDebt || 0) - (item.cashAndCashEquivalents || 0),
    link: "",
    finalLink: ""
  }));
};

const mapFinnhubToCashFlow = (data: FinnhubFinancialData): CashFlowStatement[] => {
  if (!data || !data.financials || !Array.isArray(data.financials)) return [];
  
  return data.financials.map(item => ({
    date: item.period || "",
    symbol: data.symbol,
    reportedCurrency: "USD",
    cik: "", // Required field but not provided by Finnhub
    fillingDate: item.period || "",
    acceptedDate: item.period || "",
    calendarYear: item.year?.toString() || item.period?.substring(0, 4) || "",
    period: item.period?.includes("Q") ? "Q" : "FY",
    netIncome: item.netIncome || 0,
    depreciationAndAmortization: item.depreciation || 0,
    deferredIncomeTax: item.deferredIncomeTax || 0,
    stockBasedCompensation: item.stockBasedCompensation || 0,
    changeInWorkingCapital: item.changeInWorkingCapital || 0,
    accountsReceivables: item.changeInAccountReceivables || 0,
    inventory: item.changeInInventories || 0,
    accountsPayables: item.changeInAccountPayables || 0,
    otherWorkingCapital: item.otherWorkingCapital || 0,
    otherNonCashItems: item.otherNonCashItems || 0,
    netCashProvidedByOperatingActivities: item.totalCashFromOperatingActivities || 0,
    investmentsInPropertyPlantAndEquipment: -1 * (item.capitalExpenditures || 0),
    acquisitionsNet: item.acquisitionsNet || 0,
    purchasesOfInvestments: item.purchasesOfInvestments || 0,
    salesMaturitiesOfInvestments: item.salesMaturitiesOfInvestments || 0,
    otherInvestingActivites: item.otherInvestingActivities || 0,
    netCashUsedForInvestingActivities: item.totalCashFromInvestingActivities || 0, // Fixed property name here
    debtRepayment: item.debtRepayment || 0,
    commonStockIssued: item.commonStockIssued || 0,
    commonStockRepurchased: item.commonStockRepurchased || 0,
    dividendsPaid: item.dividendsPaid || 0,
    otherFinancingActivites: item.otherFinancingActivities || 0,
    netCashUsedProvidedByFinancingActivities: item.totalCashFromFinancingActivities || 0,
    effectOfForexChangesOnCash: item.effectOfForexChangesOnCash || 0,
    netChangeInCash: item.netChangeInCash || 0,
    cashAtEndOfPeriod: item.cashAtEndOfPeriod || 0,
    cashAtBeginningOfPeriod: item.cashAtBeginningOfPeriod || 0,
    operatingCashFlow: item.totalCashFromOperatingActivities || 0,
    capitalExpenditure: item.capitalExpenditures || 0,
    freeCashFlow: (item.totalCashFromOperatingActivities || 0) - (item.capitalExpenditures || 0),
    link: "",
    finalLink: ""
  }));
};

/**
 * Fetch financial statements from Finnhub
 */
const fetchFinnhubFinancials = async (
  symbol: string,
  statement: string = "ic", // 'ic' for income, 'bs' for balance sheet, 'cf' for cash flow
  freq: string = "annual"
): Promise<any> => {
  try {
    return await invokeSupabaseFunction<FinnhubFinancialData>('get-finnhub-financials', { 
      symbol, 
      statement,
      freq
    });
  } catch (error) {
    console.error(`Error fetching Finnhub ${statement} data:`, error);
    return null;
  }
};

/**
 * Fetch income statements from Finnhub
 */
export const fetchFinnhubIncomeStatements = async (
  symbol: string,
  period: 'annual' | 'quarterly' = 'annual'
): Promise<IncomeStatement[]> => {
  try {
    const freq = period === 'annual' ? 'annual' : 'quarterly';
    const data = await fetchFinnhubFinancials(symbol, 'ic', freq);
    
    if (!data) return [];
    return mapFinnhubToIncomeStatement(data);
  } catch (error) {
    console.error("Error fetching Finnhub income statements:", error);
    return [];
  }
};

/**
 * Fetch balance sheets from Finnhub
 */
export const fetchFinnhubBalanceSheets = async (
  symbol: string,
  period: 'annual' | 'quarterly' = 'annual'
): Promise<BalanceSheet[]> => {
  try {
    const freq = period === 'annual' ? 'annual' : 'quarterly';
    const data = await fetchFinnhubFinancials(symbol, 'bs', freq);
    
    if (!data) return [];
    return mapFinnhubToBalanceSheet(data);
  } catch (error) {
    console.error("Error fetching Finnhub balance sheets:", error);
    return [];
  }
};

/**
 * Fetch cash flow statements from Finnhub
 */
export const fetchFinnhubCashFlowStatements = async (
  symbol: string,
  period: 'annual' | 'quarterly' = 'annual'
): Promise<CashFlowStatement[]> => {
  try {
    const freq = period === 'annual' ? 'annual' : 'quarterly';
    const data = await fetchFinnhubFinancials(symbol, 'cf', freq);
    
    if (!data) return [];
    return mapFinnhubToCashFlow(data);
  } catch (error) {
    console.error("Error fetching Finnhub cash flow statements:", error);
    return [];
  }
};

/**
 * Fetch all financial statements from Finnhub in one call
 */
export const fetchAllFinnhubFinancials = async (
  symbol: string,
  period: 'annual' | 'quarterly' = 'annual'
): Promise<{
  income: IncomeStatement[];
  balance: BalanceSheet[];
  cashflow: CashFlowStatement[];
}> => {
  try {
    const [income, balance, cashflow] = await Promise.all([
      fetchFinnhubIncomeStatements(symbol, period),
      fetchFinnhubBalanceSheets(symbol, period),
      fetchFinnhubCashFlowStatements(symbol, period)
    ]);
    
    return {
      income,
      balance,
      cashflow
    };
  } catch (error) {
    console.error("Error fetching all Finnhub financial data:", error);
    return {
      income: [],
      balance: [],
      cashflow: []
    };
  }
};

/**
 * Fetch ownership data from Finnhub
 */
export const fetchFinnhubOwnership = async (
  symbol: string,
  limit?: number
): Promise<OwnershipData> => {
  try {
    // Set a higher limit (up to 100) to get more ownership data
    const requestLimit = limit || 100;
    
    return await invokeSupabaseFunction<OwnershipData>('get-finnhub-ownership', { 
      symbol, 
      limit: requestLimit
    });
  } catch (error) {
    console.error("Error fetching Finnhub ownership data:", error);
    return { symbol, ownership: [] };
  }
};



import { invokeSupabaseFunction } from "./base";
import { 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement 
} from "@/types";

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
    calendarYear: item.year?.toString() || item.period?.substring(0, 4) || "",
    period: item.period?.includes("Q") ? "Q" : "FY",
    revenue: item.revenue || 0,
    costOfRevenue: item.costOfGoodsSold || 0,
    grossProfit: item.grossIncome || (item.revenue - item.costOfGoodsSold) || 0,
    grossProfitRatio: ((item.grossIncome || (item.revenue - item.costOfGoodsSold) || 0) / (item.revenue || 1)) || 0,
    researchAndDevelopmentExpenses: item.researchDevelopment || 0,
    generalAndAdministrativeExpenses: item.sgaExpense || 0,
    sellingAndMarketingExpenses: 0, // Not directly provided by Finnhub
    otherExpenses: 0, // Not directly provided by Finnhub
    operatingExpenses: item.totalOperatingExpense || 0,
    costAndExpenses: (item.totalOperatingExpense || 0) + (item.costOfGoodsSold || 0),
    operatingIncome: item.ebit || 0,
    operatingIncomeRatio: (item.ebit || 0) / (item.revenue || 1),
    interestExpense: item.interestExpense || 0,
    incomeBeforeTax: item.pretaxIncome || 0,
    incomeTaxExpense: item.provisionForIncomeTaxes || 0,
    netIncome: item.netIncome || 0,
    netIncomeRatio: (item.netIncome || 0) / (item.revenue || 1),
    eps: item.netIncomeAfterTaxes ? (item.netIncomeAfterTaxes / item.weightedAverageShsOut || 0) : 0,
    ebitda: item.ebitda || 0,
    ebitdaratio: (item.ebitda || 0) / (item.revenue || 1),
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
    calendarYear: item.year?.toString() || item.period?.substring(0, 4) || "",
    period: item.period?.includes("Q") ? "Q" : "FY",
    totalAssets: item.totalAssets || 0,
    totalCurrentAssets: item.totalCurrentAssets || 0,
    cashAndCashEquivalents: item.cashAndCashEquivalents || 0,
    shortTermInvestments: item.shortTermInvestments || 0,
    netReceivables: item.netReceivables || 0,
    inventory: item.inventory || 0,
    otherCurrentAssets: item.otherCurrentAssets || 0,
    totalNonCurrentAssets: item.totalAssets - item.totalCurrentAssets || 0,
    propertyPlantEquipmentNet: item.propertyPlantEquipment || 0,
    goodwill: item.goodwill || 0,
    intangibleAssets: item.intangibleAssets || 0,
    goodwillAndIntangibleAssets: (item.goodwill || 0) + (item.intangibleAssets || 0),
    longTermInvestments: item.longTermInvestments || 0,
    taxAssets: item.taxAssets || 0,
    otherNonCurrentAssets: item.otherNonCurrentAssets || 0,
    totalLiabilities: item.totalLiabilities || 0,
    totalCurrentLiabilities: item.totalCurrentLiabilities || 0,
    accountPayables: item.accountsPayable || 0,
    shortTermDebt: item.shortTermDebt || 0,
    taxPayables: item.taxPayables || 0,
    deferredRevenue: item.deferredRevenue || 0,
    otherCurrentLiabilities: item.otherCurrentLiabilities || 0,
    totalNonCurrentLiabilities: item.totalLiabilities - item.totalCurrentLiabilities || 0,
    longTermDebt: item.longTermDebt || 0,
    deferredRevenueNonCurrent: item.deferredRevenueLongTerm || 0,
    deferredTaxLiabilitiesNonCurrent: item.deferredTaxLiabilitiesNonCurrent || 0,
    otherNonCurrentLiabilities: item.otherNonCurrentLiabilities || 0,
    totalEquity: item.totalShareholderEquity || 0,
    treasuryStock: item.treasuryStock || 0,
    retainedEarnings: item.retainedEarnings || 0,
    commonStock: item.commonStock || 0,
    commonStockSharesOutstanding: item.commonStockSharesOutstanding || 0,
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
    operatingCashFlow: item.totalCashFromOperatingActivities || 0,
    investmentsInPropertyPlantAndEquipment: -1 * (item.capitalExpenditures || 0),
    acquisitionsNet: item.acquisitionsNet || 0,
    purchasesOfInvestments: item.purchasesOfInvestments || 0,
    salesMaturitiesOfInvestments: item.salesMaturitiesOfInvestments || 0,
    otherInvestingActivites: item.otherInvestingActivities || 0,
    netCashUsedForInvestingActivites: item.totalCashFromInvestingActivities || 0,
    debtRepayment: item.debtRepayment || 0,
    commonStockIssued: item.commonStockIssued || 0,
    commonStockRepurchased: item.commonStockRepurchased || 0,
    dividendsPaid: item.dividendsPaid || 0,
    otherFinancingActivites: item.otherFinancingActivities || 0,
    netCashUsedProvidedByFinancingActivities: item.totalCashFromFinancingActivities || 0,
    netChangeInCash: item.netChangeInCash || 0,
    cashAtEndOfPeriod: item.cashAtEndOfPeriod || 0,
    cashAtBeginningOfPeriod: item.cashAtBeginningOfPeriod || 0,
    operatingCashFlowPerShare: 0, // Not provided by Finnhub
    freeCashFlowPerShare: 0, // Not provided by Finnhub
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

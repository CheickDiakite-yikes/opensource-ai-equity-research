
export interface FinancialDataItem {
  year: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  cashAndCashEquivalents?: number;
  shortTermInvestments?: number;
  accountsReceivable?: number;
  inventory?: number;
  totalCurrentAssets?: number;
  propertyPlantEquipment?: number;
  longTermInvestments?: number;
  intangibleAssets?: number;
  totalNonCurrentAssets?: number;
  accountsPayable?: number;
  shortTermDebt?: number;
  totalCurrentLiabilities?: number;
  longTermDebt?: number;
  totalNonCurrentLiabilities?: number;
}

export interface BalanceSheetTableProps {
  data: FinancialDataItem[];
  denomination?: 'millions' | 'billions' | 'thousands';
}

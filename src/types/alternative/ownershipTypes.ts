
// Acquisition Ownership Types
export interface AcquisitionOwnershipItem {
  cik: string;
  symbol: string;
  filingDate: string;
  acceptedDate: string;
  cusip: string;
  nameOfReportingPerson: string;
  citizenshipOrPlaceOfOrganization: string;
  soleVotingPower: string;
  sharedVotingPower: string;
  soleDispositivePower: string;
  sharedDispositivePower: string;
  amountBeneficiallyOwned: string;
  percentOfClass: string;
  typeOfReportingPerson: string;
  url: string;
}

export interface AcquisitionOwnershipResponse {
  symbol: string;
  ownershipData: AcquisitionOwnershipItem[];
}

// Insider Trading Statistics Types
export interface InsiderTradingStats {
  symbol: string;
  cik: string;
  year: number;
  quarter: number;
  acquiredTransactions: number;
  disposedTransactions: number;
  acquiredDisposedRatio: number;
  totalAcquired: number;
  totalDisposed: number;
  averageAcquired: number;
  averageDisposed: number;
  totalPurchases: number;
  totalSales: number;
}

export interface InsiderTradingStatsResponse {
  symbol: string;
  tradingStats: InsiderTradingStats[];
}


export interface CongressionalTrade {
  amountFrom: number;
  amountTo: number;
  assetName: string;
  filingDate: string;
  name: string;
  ownerType: string;
  position: string;
  symbol: string;
  transactionDate: string;
  transactionType: 'Sale' | 'Purchase';
}

export interface CongressionalTradesResponse {
  data: CongressionalTrade[];
  symbol: string;
}

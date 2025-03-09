
export interface OwnershipItem {
  name: string;
  share: number;
  change: number;
  filingDate: string;
}

export interface OwnershipData {
  symbol: string;
  ownership: OwnershipItem[];
}

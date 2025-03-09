
export interface CompanyNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface SocialSentimentData {
  atTime: string;
  mention: number;
  positiveScore: number;
  negativeScore: number;
  positiveMention: number;
  negativeMention: number;
  score: number;
}

export interface SocialSentimentResponse {
  data: SocialSentimentData[];
  symbol: string;
}

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
  // Additional fields for FMP data
  link?: string;
  comment?: string;
  source?: 'finnhub' | 'fmp';
}

export interface CongressionalTradesResponse {
  data: CongressionalTrade[];
  symbol: string;
  source?: 'finnhub' | 'fmp';
}

export interface AlternativeDataState {
  companyNews: CompanyNews[];
  socialSentiment: SocialSentimentResponse | null;
  congressionalTrading: CongressionalTradesResponse | null;
  fmpHouseTrades: CongressionalTradesResponse | null;
  fmpSenateTrades: CongressionalTradesResponse | null;
  loading: {
    news: boolean;
    sentiment: boolean;
    congressional: boolean;
    fmpHouseTrades: boolean;
    fmpSenateTrades: boolean;
  };
  error: {
    news: string | null;
    sentiment: string | null;
    congressional: string | null;
    fmpHouseTrades: string | null;
    fmpSenateTrades: string | null;
  };
}

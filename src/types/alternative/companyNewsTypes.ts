
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

// Import the new types
import { AcquisitionOwnershipResponse, InsiderTradingStatsResponse } from "./ownershipTypes";

export interface AlternativeDataState {
  companyNews: CompanyNews[];
  socialSentiment: SocialSentimentResponse | null;
  acquisitionOwnership: AcquisitionOwnershipResponse | null;
  insiderTradingStats: InsiderTradingStatsResponse | null;
  loading: {
    news: boolean;
    sentiment: boolean;
    ownership: boolean;
    insiderTrading: boolean;
  };
  error: {
    news: string | null;
    sentiment: string | null;
    ownership: string | null;
    insiderTrading: string | null;
  };
}

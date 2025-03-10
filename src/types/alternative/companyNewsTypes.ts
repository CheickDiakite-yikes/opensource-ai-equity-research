// If the file doesn't exist, create it with the updated type definition
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

export interface SocialSentiment {
  atTime: string;
  mention: number;
  positiveScore: number;
  negativeScore: number;
  positiveMention: number;
  negativeMention: number;
  score: number;
}

export interface SocialSentimentResponse {
  symbol: string;
  data: SocialSentiment[];
}

export interface AlternativeDataState {
  companyNews: CompanyNews[];
  socialSentiment: SocialSentimentResponse | null;
  loading: {
    news: boolean;
    sentiment: boolean;
  };
  error: {
    news: string | null;
    sentiment: string | null;
  };
}

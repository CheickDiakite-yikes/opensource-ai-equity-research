
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
  data: SocialSentiment[];
  symbol: string;
}

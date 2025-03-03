
// Re-export all types from domain-specific files
export * from './apiTypes';
export * from './historicalDataTypes';
export * from './financialStatementTypes';
export * from './documentTypes';
export * from './aiAnalysisTypes';

// Add new interface for Rating and Recommendation
export interface RatingDetails {
  ratingScale: string;
  ratingJustification?: string;
}

// Updated ResearchReport interface to match aiAnalysisTypes
export interface ResearchReport {
  id?: string;
  companyName: string;
  symbol: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  summary: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  scenarioAnalysis?: {
    bullCase: {
      price: string;
      probability: string;
      drivers: string[];
    };
    baseCase: {
      price: string;
      probability: string;
      drivers: string[];
    };
    bearCase: {
      price: string;
      probability: string;
      drivers: string[];
    };
  };
  catalysts?: {
    positive: string[];
    negative: string[];
    timeline?: {
      shortTerm: string[];
      mediumTerm: string[];
      longTerm: string[];
    };
  };
  ratingDetails?: RatingDetails;
}

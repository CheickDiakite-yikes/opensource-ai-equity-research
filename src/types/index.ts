
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

// Updated ResearchReport interface to resolve type errors
export interface ResearchReport {
  id?: string;  // Making id optional to fix the mismatch with aiAnalysisTypes
  companyName: string;
  symbol: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  summary: string; // Added summary field
  sections: Array<{
    title: string;
    content: string;
  }>;
  // Updated scenarioAnalysis structure to match what's used in the components
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
  // Updated catalysts structure to match what's used in the components
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


/**
 * Research Report Section
 */
export interface ReportSection {
  title: string;
  content: string;
}

/**
 * Rating Details
 */
export interface RatingDetails {
  overallRating: string;
  financialStrength: string;
  growthOutlook: string;
  valuationAttractiveness: string;
  competitivePosition: string;
}

/**
 * Scenario Analysis
 */
export interface ScenarioAnalysis {
  bullCase: {
    price: string;
    description: string;
  };
  baseCase: {
    price: string;
    description: string;
  };
  bearCase: {
    price: string;
    description: string;
  };
}

/**
 * Research Report
 */
export interface ResearchReport {
  symbol: string;
  companyName: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  summary: string;
  sections: ReportSection[];
  ratingDetails?: RatingDetails;
  scenarioAnalysis?: ScenarioAnalysis;
  catalysts?: string[];
}

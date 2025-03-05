
// Define types for the response
export interface ReportSection {
  title: string;
  content: string;
}

export interface RatingDetails {
  overallRating: string;
  financialStrength: string;
  growthOutlook: string;
  valuationAttractiveness: string;
  competitivePosition: string;
  ratingScale?: string;
  ratingJustification?: string;
}

export interface ScenarioAnalysis {
  bullCase: { 
    price: string; 
    description: string; 
    probability?: string;
    drivers?: string[];
  };
  baseCase: { 
    price: string; 
    description: string; 
    probability?: string;
    drivers?: string[];
  };
  bearCase: { 
    price: string; 
    description: string; 
    probability?: string;
    drivers?: string[];
  };
}

export interface CatalystTimeline {
  shortTerm?: string[];
  mediumTerm?: string[];
  longTerm?: string[];
}

export interface GrowthCatalysts {
  positive?: string[];
  negative?: string[];
  timeline?: CatalystTimeline;
}

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
  catalysts?: GrowthCatalysts;
}

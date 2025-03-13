
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
  // Add the properties used in the components
  ratingScale?: string;
  ratingJustification?: string;
}

/**
 * Scenario Analysis
 */
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

/**
 * Catalyst Timeline
 */
export interface CatalystTimeline {
  shortTerm?: string[];
  mediumTerm?: string[];
  longTerm?: string[];
}

/**
 * Growth Catalysts
 */
export interface GrowthCatalysts {
  positive?: string[];
  negative?: string[];
  timeline?: CatalystTimeline;
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
  catalysts?: GrowthCatalysts;
  
  // Added for compatibility with existing code
  reportDate?: string;
  executiveSummary?: string;
  investmentHighlights?: string[];
  companyDescription?: string;
  businessModel?: string;
  productsServices?: string;
  industryOverview?: string;
  competitiveLandscape?: string;
  financialSummary?: string;
  revenueAnalysis?: string;
  profitabilityAnalysis?: string;
  balanceSheetAnalysis?: string;
  cashFlowAnalysis?: string;
  valuationSummary?: string;
  peRatio?: string;
  pbRatio?: string;
  evToEbitda?: string;
  dividendYield?: string;
  discountedCashFlow?: string;
  priceForecast?: string;
  technicalSummary?: string;
  trendAnalysis?: string;
  supportResistanceLevels?: string;
  movingAverages?: string;
  relativeStrengthIndex?: string;
  macdAnalysis?: string;
  investmentThesis?: string;
  growthProspects?: string;
  competitiveAdvantages?: string;
  // Remove the duplicate catalysts field
  // catalysts?: string; 
  riskSummary?: string;
  marketRisks?: string;
  businessRisks?: string;
  financialRisks?: string;
  regulatoryRisks?: string;
}

/**
 * Report Request
 */
export interface ReportRequest {
  symbol: string;
  companyName: string;
  sector?: string;
  industry?: string;
  description?: string;
  stockData?: any;
  financials?: {
    income?: any[];
    balance?: any[];
    cashflow?: any[];
    ratios?: any[];
  };
  news?: any[];
  peers?: string[];
  reportType?: string;
}

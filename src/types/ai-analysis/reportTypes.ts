
export interface ResearchReport {
  symbol: string;
  companyName: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  summary?: string;
  sections: ReportSection[];
  ratingDetails?: {
    overallRating: string;
    financialStrength: string;
    growthOutlook: string;
    valuationAttractiveness: string;
    competitivePosition: string;
    ratingScale?: string;
    ratingJustification?: string;
  };
  scenarioAnalysis?: {
    bullCase: Scenario;
    baseCase: Scenario;
    bearCase: Scenario;
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
  // Enhanced data from the new endpoints
  analystConsensus?: {
    buyCount: number;
    holdCount: number;
    sellCount: number;
    strongBuyCount: number;
    strongSellCount: number;
    consensusRating: string;
    targetPrice: string;
    analystCount: number;
  };
  earningsData?: {
    nextEarningsDate: string;
    estimatedEPS: number;
    estimatedRevenue: number;
    previousEarnings: {
      date: string;
      epsActual: number;
      epsEstimate: number;
      epsSurprise: number;
      revenueActual: number;
      revenueEstimate: number;
      revenueSurprise: number;
    }[];
  };
  enterpriseValue?: {
    value: number;
    evToMarketCap: number;
    evToEbitda: number;
    evToRevenue: number;
    totalDebt: number;
    cashAndEquivalents: number;
  };
  analystEstimates?: {
    revenueEstimates: {
      year: string;
      low: number;
      high: number;
      average: number;
      growth: number;
    }[];
    epsEstimates: {
      year: string;
      low: number;
      high: number;
      average: number;
      growth: number;
    }[];
    analystCount: number;
  };
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface Scenario {
  price: string;
  description: string;
  probability: string;
  drivers?: string[];
}

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
    [key: string]: any;
  };
  news?: any[];
  peers?: string[];
  reportType?: string;
}

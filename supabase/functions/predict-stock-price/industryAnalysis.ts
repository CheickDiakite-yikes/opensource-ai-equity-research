
/**
 * Get industry-specific growth context for better predictions
 */
export function getIndustryGrowthContext(industry: string): string {
  switch (industry) {
    case 'Technology':
      return 'higher growth potential but can be volatile due to rapid innovation cycles';
    case 'Financial':
      return 'moderate growth potential that is sensitive to interest rates and economic cycles';
    case 'Healthcare':
      return 'stable growth with defensive qualities during economic downturns';
    case 'Consumer Goods':
      return 'modest but reliable growth with focus on stable cash flows';
    case 'Retail':
      return 'competitive growth dependent on consumer spending patterns';
    case 'Automotive':
      return 'cyclical growth dependent on economic conditions and innovation';
    case 'Entertainment':
      return 'growth tied to consumer discretionary spending and content popularity';
    case 'Semiconductor':
      return 'high growth potential but subject to cyclical demand and supply constraints';
    default:
      return 'varying growth patterns depending on specific company factors';
  }
}

/**
 * Format market cap for better context
 */
export function formatMarketCap(marketCap: number | undefined): string {
  if (!marketCap) return 'Unknown';
  
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)} trillion (Large Cap)`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)} billion (${marketCap >= 200e9 ? 'Large' : marketCap >= 10e9 ? 'Mid' : 'Small'} Cap)`;
  } else {
    return `$${(marketCap / 1e6).toFixed(2)} million (Small Cap)`;
  }
}

/**
 * Get industry-specific constraints for predicted prices
 */
export function getIndustryConstraints(industry: string): {
  oneMonth: number;
  threeMonths: number;
  sixMonths: number;
  oneYear: number;
} {
  const defaults = {
    oneMonth: 0.1,    // 10%
    threeMonths: 0.2, // 20%
    sixMonths: 0.35,  // 35%
    oneYear: 0.5      // 50%
  };
  
  const constraints: Record<string, typeof defaults> = {
    'Technology': {
      oneMonth: 0.15,
      threeMonths: 0.25,
      sixMonths: 0.4,
      oneYear: 0.6
    },
    'Financial': {
      oneMonth: 0.07,
      threeMonths: 0.15,
      sixMonths: 0.25,
      oneYear: 0.35
    },
    'Healthcare': {
      oneMonth: 0.08,
      threeMonths: 0.18,
      sixMonths: 0.3,
      oneYear: 0.45
    },
    'Consumer Goods': {
      oneMonth: 0.06,
      threeMonths: 0.12,
      sixMonths: 0.2,
      oneYear: 0.3
    },
    'Retail': {
      oneMonth: 0.1,
      threeMonths: 0.2,
      sixMonths: 0.3,
      oneYear: 0.45
    },
    'Automotive': {
      oneMonth: 0.15,
      threeMonths: 0.25,
      sixMonths: 0.4,
      oneYear: 0.7
    },
    'Semiconductor': {
      oneMonth: 0.18,
      threeMonths: 0.3,
      sixMonths: 0.5,
      oneYear: 0.8
    }
  };
  
  return constraints[industry] || defaults;
}

/**
 * Determine industry for better prediction context
 */
export function determineIndustry(symbol: string): string {
  const industries: Record<string, string> = {
    'AAPL': 'Technology',
    'MSFT': 'Technology',
    'GOOG': 'Technology',
    'AMZN': 'Retail',
    'META': 'Technology',
    'TSLA': 'Automotive',
    'NVDA': 'Semiconductor',
    'JPM': 'Financial',
    'BAC': 'Financial',
    'WMT': 'Retail',
    'JNJ': 'Healthcare',
    'PG': 'Consumer Goods',
    'V': 'Financial',
    'MA': 'Financial',
    'DIS': 'Entertainment',
    'NFLX': 'Entertainment'
  };
  
  return industries[symbol] || 'Technology';
}

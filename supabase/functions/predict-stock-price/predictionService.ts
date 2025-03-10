
import { StockPrediction, FormattedData } from "./types.ts";
import { generatePredictionWithOpenAI } from "./openaiService.ts";

export { generatePredictionWithOpenAI };

// Add enhanced industry context for better predictions
export const getIndustryContext = (industry: string): string => {
  switch(industry.toLowerCase()) {
    case 'technology':
      return 'high growth potential with significant volatility due to rapid innovation';
    case 'healthcare':
      return 'moderate growth with defensive characteristics and regulatory factors';
    case 'financials':
      return 'sensitivity to interest rates and economic cycles with moderate growth';
    case 'consumer staples':
      return 'stable growth with defensive characteristics and lower volatility';
    case 'energy':
      return 'cyclical performance heavily influenced by commodity prices';
    case 'utilities':
      return 'stable income with regulatory constraints and modest growth';
    case 'industrials':
      return 'moderate growth tied to economic cycles and capex trends';
    case 'materials':
      return 'cyclical performance with sensitivity to global economic activity';
    case 'real estate':
      return 'income-oriented with sensitivity to interest rates and regional trends';
    case 'communication services':
      return 'evolving growth profile with mixture of legacy and technology segments';
    default:
      return 'varied performance metrics dependent on specific business model';
  }
};


import { getCurrentPrice } from "./priceUtils";
import { FormattedDCFData, DCFSensitivityData, YearlyDCFData, DCFAssumptionsSummary } from "@/types/ai-analysis/dcfTypes";

/**
 * Prepare mock DCF data for when real data is not available
 */
export const prepareMockDCFData = (financials: any[]): FormattedDCFData => {
  const latestFinancial = getLatestFinancial(financials);
  const currentPrice = getCurrentPrice(financials);
  
  // Use real financial data if available, otherwise use defaults
  const financialMetrics = extractFinancialMetrics(latestFinancial);
  const mockProjections = createMockProjections(financialMetrics);
  const mockSensitivity = createMockSensitivityAnalysis(currentPrice);
  const intrinsicValue = calculateMockIntrinsicValue(financialMetrics, currentPrice);
  
  return {
    intrinsicValue,
    currentPrice,
    upside: ((intrinsicValue / currentPrice - 1) * 100).toFixed(2) + '%',
    assumptions: {
      growthRate: "8.5% (first 5 years), 3% (terminal)",
      discountRate: "9.5%",
      terminalMultiple: "15x",
      taxRate: "21%"
    },
    projections: mockProjections,
    sensitivity: mockSensitivity
  };
};

/**
 * Extract key financial metrics from the latest financial data
 */
const extractFinancialMetrics = (latestFinancial: any) => {
  const revenue = latestFinancial?.revenue || 10000;
  const operatingIncome = latestFinancial?.operatingIncome || revenue * 0.20;
  const netIncome = latestFinancial?.netIncome || revenue * 0.15;
  const sharesOutstanding = latestFinancial?.sharesOutstanding || 1000000000;
  
  return { revenue, operatingIncome, netIncome, sharesOutstanding };
};

/**
 * Get the latest financial data from the financials array
 */
const getLatestFinancial = (financials: any[]) => {
  if (!financials || financials.length === 0) return null;
  
  return financials.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
};

/**
 * Calculate mock intrinsic value based on financial metrics
 */
const calculateMockIntrinsicValue = (
  metrics: { netIncome: number, sharesOutstanding: number }, 
  currentPrice: number
): number => {
  const { netIncome, sharesOutstanding } = metrics;
  
  // Generate a reasonable intrinsic value based on PE ratio (15-25x earnings is common)
  // We'll use 20x as a middle ground
  const peRatio = 20;
  const estimatedIntrinsicValue = netIncome > 0 
    ? (netIncome / sharesOutstanding) * peRatio
    : currentPrice * 1.15; // Fallback
    
  return Math.max(estimatedIntrinsicValue, currentPrice * 0.75); // Realistic valuation
};

/**
 * Create mock sensitivity analysis table
 */
export const createMockSensitivityAnalysis = (currentPrice: number): DCFSensitivityData => {
  return {
    headers: ["", "8.5%", "9.0%", "9.5%", "10.0%", "10.5%"],
    rows: [
      { growth: "2.0%", values: [
        currentPrice * 1.20, 
        currentPrice * 1.15, 
        currentPrice * 1.10, 
        currentPrice * 1.05, 
        currentPrice * 1.00
      ]},
      { growth: "2.5%", values: [
        currentPrice * 1.25, 
        currentPrice * 1.20, 
        currentPrice * 1.15, 
        currentPrice * 1.10, 
        currentPrice * 1.05
      ]},
      { growth: "3.0%", values: [
        currentPrice * 1.30, 
        currentPrice * 1.25, 
        currentPrice * 1.20, 
        currentPrice * 1.15, 
        currentPrice * 1.10
      ]},
      { growth: "3.5%", values: [
        currentPrice * 1.35, 
        currentPrice * 1.30, 
        currentPrice * 1.25, 
        currentPrice * 1.20, 
        currentPrice * 1.15
      ]},
      { growth: "4.0%", values: [
        currentPrice * 1.40, 
        currentPrice * 1.35, 
        currentPrice * 1.30, 
        currentPrice * 1.25, 
        currentPrice * 1.20
      ]}
    ]
  };
};

/**
 * Create mock projections for 5 years
 */
const createMockProjections = (metrics: { revenue: number, operatingIncome: number, netIncome: number }): YearlyDCFData[] => {
  const { revenue, operatingIncome, netIncome } = metrics;
  
  // Create growth rate estimates (realistic growth tapering)
  const growthRates = [0.085, 0.08, 0.075, 0.07, 0.065];
  const currentYear = new Date().getFullYear();
  
  return [1, 2, 3, 4, 5].map(year => {
    // Apply growth rate with tapering growth (more realistic)
    const yearIndex = year - 1;
    const yearGrowth = growthRates[yearIndex] || 0.065;
    const cumulativeGrowth = Math.pow(1 + yearGrowth, year);
    
    // Estimated values based on revenue
    const mockRevenue = Math.round(revenue * cumulativeGrowth);
    const mockEbit = Math.round(operatingIncome * cumulativeGrowth);
    const mockEbitda = Math.round(mockEbit * 1.2); // Approximate EBITDA
    const mockFcf = Math.round(netIncome * 0.8 * cumulativeGrowth);
    
    return {
      year: `${currentYear + year - 1}`,
      revenue: mockRevenue,
      ebit: mockEbit,
      ebitda: mockEbitda,
      freeCashFlow: mockFcf,
      operatingCashFlow: mockFcf * 1.25, // Approximate operating cash flow
      capitalExpenditure: mockFcf * -0.25 // Approximate capex (negative)
    };
  });
};

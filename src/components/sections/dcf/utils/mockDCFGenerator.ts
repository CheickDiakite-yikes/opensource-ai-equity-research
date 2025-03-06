
import { DCFSensitivityData, FormattedDCFData } from "@/types/ai-analysis/dcfTypes";

/**
 * Generate mock sensitivity analysis grid for DCF
 */
export const createMockSensitivityAnalysis = (basePrice: number = 100): DCFSensitivityData => {
  // Create growth rates (rows)
  const growthRates = [2.0, 2.5, 3.0, 3.5, 4.0];
  
  // Create discount rates (columns)
  const discountRates = [8.5, 9.0, 9.5, 10.0, 10.5];
  
  // Generate price matrix
  const rows = growthRates.map(growth => {
    // Calculate values for this growth rate across all discount rates
    const values = discountRates.map(discount => {
      // Simple DCF approximation formula - higher growth = higher price, higher discount = lower price
      const multiplier = (1 + (growth / 100)) / (1 + (discount / 100));
      return Math.round(basePrice * multiplier * 100) / 100;
    });
    
    return {
      growth: `${growth.toFixed(1)}%`,
      values
    };
  });
  
  return {
    headers: discountRates.map(d => `${d.toFixed(1)}%`),
    rows
  };
};

/**
 * Create complete mock DCF data when real calculation fails
 */
export const createMockDCFData = (financials: any[]): FormattedDCFData => {
  // Extract base price from financials if available
  const currentPrice = financials && financials.length > 0 ? 
    (financials[0].price || 100) : 100;
  
  // Generate an optimistic intrinsic value (slightly higher than current price)
  const intrinsicValue = currentPrice * 1.15;
  
  // Create mock projected cash flows for 5 years
  const currentYear = new Date().getFullYear();
  const baseRevenue = financials && financials.length > 0 ?
    (financials[0].revenue || 100000) : 100000;
  const baseEbit = baseRevenue * 0.25;
  const baseEbitda = baseRevenue * 0.32;
  const baseOperatingCashFlow = baseRevenue * 0.28;
  const baseCapex = baseRevenue * 0.03;
  const baseFreeCashFlow = baseOperatingCashFlow - baseCapex;
  
  const projections = Array.from({ length: 5 }, (_, i) => {
    const year = (currentYear + i).toString();
    const growthFactor = Math.pow(1.085, i); // 8.5% annual growth
    
    return {
      year,
      revenue: Math.round(baseRevenue * growthFactor),
      ebit: Math.round(baseEbit * growthFactor),
      ebitda: Math.round(baseEbitda * growthFactor),
      operatingCashFlow: Math.round(baseOperatingCashFlow * growthFactor),
      capitalExpenditure: Math.round(baseCapex * growthFactor),
      freeCashFlow: Math.round(baseFreeCashFlow * growthFactor)
    };
  });
  
  return {
    intrinsicValue,
    currentPrice,
    upside: `${((intrinsicValue / currentPrice - 1) * 100).toFixed(1)}%`,
    assumptions: {
      growthRate: "8.5% (first 5 years), 3% (terminal)",
      discountRate: "9.5%",
      terminalMultiple: "15x",
      taxRate: "21%"
    },
    projections,
    sensitivity: createMockSensitivityAnalysis(currentPrice)
  };
};

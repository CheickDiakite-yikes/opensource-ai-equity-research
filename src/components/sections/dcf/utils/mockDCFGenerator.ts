
import { FormattedDCFData, DCFSensitivityData } from "@/types/ai-analysis/dcfTypes";

/**
 * Generate growth rates for sensitivity analysis
 */
const generateGrowthRates = (): string[] => {
  const rates = [];
  for (let i = 2.0; i <= 4.0; i += 0.5) {
    rates.push(`${i.toFixed(1)}%`);
  }
  return rates;
};

/**
 * Generate discount rates for sensitivity analysis
 */
const generateDiscountRates = (): string[] => {
  const rates = [];
  for (let i = 8.5; i <= 10.5; i += 0.5) {
    rates.push(`${i.toFixed(1)}%`);
  }
  return rates;
};

/**
 * Create sensitivity analysis data
 */
const createSensitivityData = (currentPrice: number): DCFSensitivityData => {
  const growthRates = generateGrowthRates();
  const discountRates = generateDiscountRates();
  
  // Create headers with "Growth↓ Discount→" as first item
  const headers = ["Growth↓ Discount→", ...discountRates];
  
  // Generate rows with values
  const rows = growthRates.map((growth, gIndex) => {
    // Base calculation factors - higher growth = higher price
    const growthFactor = 1 + (gIndex * 0.1);
    
    const values = discountRates.map((discount, dIndex) => {
      // Higher discount = lower price
      const discountFactor = 1 - (dIndex * 0.05);
      
      // Calculate a value based on current price with these factors
      const baseValue = currentPrice * growthFactor * discountFactor;
      return Math.round(baseValue * 100) / 100;
    });
    
    return {
      growth,
      values
    };
  });
  
  return {
    headers,
    rows
  };
};

/**
 * Prepare mock DCF data when real data isn't available
 */
export const prepareMockDCFData = (financials: any[], currentPrice: number): FormattedDCFData => {
  // Use realistic price based on the provided value
  const intrinsicValue = Math.round(currentPrice * 1.3 * 100) / 100; // 30% upside from current
  
  // Calculate upside percentage
  const upside = ((intrinsicValue - currentPrice) / currentPrice) * 100;
  
  const mockData: FormattedDCFData = {
    intrinsicValue,
    currentPrice,
    upside,
    assumptions: {
      growthRate: "2.0% (first 5 years), 3.0% (terminal)",
      discountRate: "9.5%",
      terminalMultiple: "15.0x",
      taxRate: "21.0%"
    },
    sensitivity: createSensitivityData(currentPrice),
    projections: [
      {
        year: new Date().getFullYear() + 1,
        revenue: currentPrice * 400000000,
        ebit: currentPrice * 120000000,
        ebitda: currentPrice * 145000000,
        freeCashFlow: currentPrice * 110000000,
      },
      {
        year: new Date().getFullYear() + 2,
        revenue: currentPrice * 420000000,
        ebit: currentPrice * 128000000,
        ebitda: currentPrice * 153000000,
        freeCashFlow: currentPrice * 117000000,
      },
      {
        year: new Date().getFullYear() + 3,
        revenue: currentPrice * 442000000,
        ebit: currentPrice * 136500000,
        ebitda: currentPrice * 161000000,
        freeCashFlow: currentPrice * 124000000,
      },
      {
        year: new Date().getFullYear() + 4,
        revenue: currentPrice * 465000000,
        ebit: currentPrice * 145000000,
        ebitda: currentPrice * 170000000,
        freeCashFlow: currentPrice * 132000000,
      },
      {
        year: new Date().getFullYear() + 5,
        revenue: currentPrice * 489000000,
        ebit: currentPrice * 154000000,
        ebitda: currentPrice * 179000000,
        freeCashFlow: currentPrice * 140000000,
      }
    ]
  };
  
  return mockData;
};

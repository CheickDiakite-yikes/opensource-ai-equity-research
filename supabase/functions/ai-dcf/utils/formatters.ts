
// Format the DCF result from the advanced levered DCF API
export function formatDCFResult(
  symbol: string, 
  dcfResult: any, 
  profile: any, 
  financialsData: any[], 
  metricsData: any[], 
  averageRevenueGrowth: number, 
  wacc: number, 
  terminalGrowth: number, 
  beta: number, 
  taxRate: number,
  currentPrice: number
) {
  // Calculate projected FCFs from the result (yearly for 5 years)
  const projectedFCFs = [];
  for (let i = 1; i <= 5; i++) {
    // Simple projection based on growth rate
    const fcf = dcfResult.freeCashFlow * Math.pow(1 + averageRevenueGrowth, i);
    projectedFCFs.push(parseFloat(fcf.toFixed(2)));
  }
  
  // Calculate upside/downside percentage
  const intrinsicValuePerShare = dcfResult.equityValuePerShare;
  const upside = currentPrice > 0 ? ((intrinsicValuePerShare - currentPrice) / currentPrice) * 100 : null;
  
  // Create industry comparison if metrics data available
  let industryComparison = null;
  if (metricsData && metricsData.length > 0) {
    // Using some estimated industry averages for now
    // In a real implementation, we would fetch industry averages from FMP
    const industryRevenueGrowth = averageRevenueGrowth * 0.9; // Slightly lower than company
    const industryProfitMargin = 0.08; // Industry average profit margin
    const industryDebtRatio = 0.4; // Industry average debt ratio
    
    const companyMetrics = metricsData[0];
    industryComparison = {
      revenueGrowth: { 
        company: averageRevenueGrowth, 
        industry: industryRevenueGrowth,
        difference: formatDifference(averageRevenueGrowth - industryRevenueGrowth)
      },
      profitMargin: { 
        company: companyMetrics?.netProfitMargin || financialsData[0].netIncomeRatio || 0, 
        industry: industryProfitMargin,
        difference: formatDifference((companyMetrics?.netProfitMargin || financialsData[0].netIncomeRatio || 0) - industryProfitMargin)
      },
      debtRatio: { 
        company: companyMetrics?.debtToAssets || 0.3, 
        industry: industryDebtRatio,
        difference: formatDifference((companyMetrics?.debtToAssets || 0.3) - industryDebtRatio, true)
      }
    };
  }
  
  // Calculate additional metrics for sensitivity analysis
  const bullishScenario = {
    growth: averageRevenueGrowth * 1.2,
    wacc: wacc * 0.9,
    intrinsicValue: intrinsicValuePerShare * 1.25
  };
  
  const bearishScenario = {
    growth: averageRevenueGrowth * 0.8,
    wacc: wacc * 1.1,
    intrinsicValue: intrinsicValuePerShare * 0.75
  };
  
  // Return the comprehensive DCF result
  return {
    ticker: symbol,
    companyName: profile.companyName,
    sector: profile.sector,
    industry: profile.industry,
    assumptions: {
      averageRevenueGrowth: averageRevenueGrowth,
      wacc: dcfResult.wacc || wacc,
      terminalGrowth: terminalGrowth,
      beta: beta,
      taxRate: taxRate > 0 && taxRate < 1 ? taxRate : 0.21
    },
    projectedFCFs: projectedFCFs,
    terminalValue: dcfResult.terminalValue,
    dcfValue: dcfResult.enterpriseValue,
    enterpriseValue: dcfResult.enterpriseValue,
    equityValue: dcfResult.equityValue,
    sharesOutstanding: dcfResult.dilutedSharesOutstanding,
    intrinsicValuePerShare: intrinsicValuePerShare,
    currentPrice: currentPrice,
    upside: upside,
    timestamp: new Date().toISOString(),
    aiGenerated: true,
    industryComparison,
    scenarioAnalysis: {
      base: {
        growthRate: averageRevenueGrowth,
        wacc: dcfResult.wacc || wacc,
        intrinsicValue: intrinsicValuePerShare
      },
      bullish: bullishScenario,
      bearish: bearishScenario
    },
    keyMetrics: {
      pe: profile.pe,
      marketCap: profile.mktCap,
      lastDividend: profile.lastDiv,
      volume: profile.volAvg,
      exchange: profile.exchange
    }
  };
}

// Format the DCF result from the regular DCF API
export function formatDCFResultFromRegularDCF(
  symbol: string, 
  regularDcfResult: any, 
  profile: any, 
  financialsData: any[], 
  metricsData: any[], 
  averageRevenueGrowth: number, 
  wacc: number, 
  terminalGrowth: number, 
  beta: number, 
  taxRate: number,
  currentPrice: number
) {
  // Use values from the regular DCF API
  const dcfValue = regularDcfResult.dcf || 0;
  const stockPrice = regularDcfResult.stockPrice || currentPrice;
  
  // Estimate other values that aren't provided by the regular DCF API
  const sharesOutstanding = profile.mktCap / stockPrice || 1000000000;
  const enterpriseValue = dcfValue * sharesOutstanding;
  
  // Estimate equity value (enterprise value + cash - debt)
  // If we had balance sheet data, we'd use that
  const equityValue = enterpriseValue;
  
  // Calculate terminal value (estimated)
  const terminalValue = enterpriseValue * 0.7; // Assuming terminal value is about 70% of enterprise value
  
  // Calculate projected FCFs (estimated)
  const projectedFCFs = [];
  // Estimate the first year FCF
  const estimatedAnnualFCF = enterpriseValue * 0.05; // Assuming FCF yield of ~5%
  
  for (let i = 1; i <= 5; i++) {
    const fcf = estimatedAnnualFCF * Math.pow(1 + averageRevenueGrowth, i);
    projectedFCFs.push(parseFloat(fcf.toFixed(2)));
  }
  
  // Calculate upside/downside percentage
  const intrinsicValuePerShare = dcfValue;
  const upside = stockPrice > 0 ? ((intrinsicValuePerShare - stockPrice) / stockPrice) * 100 : null;
  
  // Create industry comparison if metrics data available (same as before)
  let industryComparison = null;
  if (metricsData && metricsData.length > 0) {
    const industryRevenueGrowth = averageRevenueGrowth * 0.9;
    const industryProfitMargin = 0.08;
    const industryDebtRatio = 0.4;
    
    const companyMetrics = metricsData[0];
    industryComparison = {
      revenueGrowth: { 
        company: averageRevenueGrowth, 
        industry: industryRevenueGrowth,
        difference: formatDifference(averageRevenueGrowth - industryRevenueGrowth)
      },
      profitMargin: { 
        company: companyMetrics?.netProfitMargin || financialsData[0].netIncomeRatio || 0, 
        industry: industryProfitMargin,
        difference: formatDifference((companyMetrics?.netProfitMargin || financialsData[0].netIncomeRatio || 0) - industryProfitMargin)
      },
      debtRatio: { 
        company: companyMetrics?.debtToAssets || 0.3, 
        industry: industryDebtRatio,
        difference: formatDifference((companyMetrics?.debtToAssets || 0.3) - industryDebtRatio, true)
      }
    };
  }
  
  // Calculate scenario analysis
  const bullishScenario = {
    growth: averageRevenueGrowth * 1.2,
    wacc: wacc * 0.9,
    intrinsicValue: intrinsicValuePerShare * 1.25
  };
  
  const bearishScenario = {
    growth: averageRevenueGrowth * 0.8,
    wacc: wacc * 1.1,
    intrinsicValue: intrinsicValuePerShare * 0.75
  };
  
  // Return the DCF result based on the regular DCF API
  return {
    ticker: symbol,
    companyName: profile.companyName,
    sector: profile.sector,
    industry: profile.industry,
    assumptions: {
      averageRevenueGrowth: averageRevenueGrowth,
      wacc: wacc,
      terminalGrowth: terminalGrowth,
      beta: beta,
      taxRate: taxRate > 0 && taxRate < 1 ? taxRate : 0.21
    },
    projectedFCFs: projectedFCFs,
    terminalValue: terminalValue,
    dcfValue: enterpriseValue,
    enterpriseValue: enterpriseValue,
    equityValue: equityValue,
    sharesOutstanding: sharesOutstanding,
    intrinsicValuePerShare: intrinsicValuePerShare,
    currentPrice: stockPrice,
    upside: upside,
    timestamp: new Date().toISOString(),
    aiGenerated: true,
    industryComparison,
    scenarioAnalysis: {
      base: {
        growthRate: averageRevenueGrowth,
        wacc: wacc,
        intrinsicValue: intrinsicValuePerShare
      },
      bullish: bullishScenario,
      bearish: bearishScenario
    },
    keyMetrics: {
      pe: profile.pe,
      marketCap: profile.mktCap,
      lastDividend: profile.lastDiv,
      volume: profile.volAvg,
      exchange: profile.exchange
    }
  };
}

// Helper function to format comparison differences
export function formatDifference(diff: number, isDebtRatio: boolean = false): string {
  // For debt ratio, lower is better
  if (isDebtRatio) diff = -diff;
  
  if (diff > 0) {
    return `+${(diff * 100).toFixed(2)}% better than industry`;
  } else if (diff < 0) {
    return `${(diff * 100).toFixed(2)}% worse than industry`;
  }
  return "on par with industry";
}
